using Microsoft.EntityFrameworkCore;
using xablauBack.Application.Contracts.Carrinho;
using xablauBack.Application.Contracts.Pedidos;
using xablauBack.Domain.Entities;
using xablauBack.Infrastructure.Data;

namespace xablauBack.Application.Services.Carrinho;

public class CarrinhoService : ICarrinhoService /* regras de negócio do carrinho */
{
    private readonly AppDbContext _context;

    public CarrinhoService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<CarrinhoResponse?> ObterCarrinhoPorUsuarioAsync(int usuarioId)
    {
        var carrinho = await _context.Carrinhos /* acessa a tablela de carrinhos */
            .Include(carrinho => carrinho.Itens) /* faz o EF trazer os itens do carrinho */
            .ThenInclude(itemCarrinho => itemCarrinho.Produto) /* carrega cada produto de cada item */
            .FirstOrDefaultAsync(carrinho => carrinho.UsuarioId == usuarioId); /* busca o primeiro carrinho daquele usuário */

        if (carrinho is null) /* se não achar o carrinho retorna null */
        {
            return null;
        }

        var response = new CarrinhoResponse
        {
            CarrinhoId = carrinho.Id,
            UsuarioId = carrinho.UsuarioId,
            Itens = carrinho.Itens.Select(item => new CarrinhoItemResponse /* organizando o que vai para o banco */
            {
                ProdutoId = item.ProdutoId,
                Nome = item.Produto.Nome,
                ImagemUrl = item.Produto.ImagemUrl,
                Preco = item.Produto.Preco,
                Estoque = item.Produto.Estoque,
                Quantidade = item.Quantidade,
                Subtotal = item.Produto.Preco * item.Quantidade
            }).ToList()
        };

        response.Total = response.Itens.Sum(item => item.Subtotal); /* soma tudo */

        return response;
    }

    public async Task<CarrinhoResponse?> AdicionarItemAsync(int usuarioId, AdicionarItemCarrinhoRequest request)
    {
        if (request.Quantidade <= 0) /* bloqueia quantidade inválida */
        {
            return null;
        }

        var carrinho = await _context.Carrinhos
            .Include(carrinho => carrinho.Itens) /* busca o carrinho com os itens que ele já tem */
            .FirstOrDefaultAsync(carrinho => carrinho.UsuarioId == usuarioId); /* confere se bate com o usuário */

        if (carrinho is null)
        {
            return null;
        }

        var produto = await _context.Produtos
            .FirstOrDefaultAsync(produto => produto.Id == request.ProdutoId);

        if (produto is null)
        {
            return null;
        }

        /* verifica se o produto já está no carrinho, se não existe cria novo, se já existe soma */
        var itemExistente = carrinho.Itens
            .FirstOrDefault(itemExistente => itemExistente.ProdutoId == request.ProdutoId);

        var quantidadeAtual = itemExistente?.Quantidade ?? 0;
        var novaQuantidade = quantidadeAtual + request.Quantidade;

        if (produto.Estoque <= 0 || novaQuantidade > produto.Estoque)
        {
            return null;
        }

        if (itemExistente is null)
        {
            var novoItem = new ItemCarrinho
            {
                CarrinhoId = carrinho.Id,
                ProdutoId = produto.Id,
                Quantidade = request.Quantidade
            };

            _context.ItensCarrinho.Add(novoItem);
        }
        else
        {
            itemExistente.Quantidade += request.Quantidade;
        }

        await _context.SaveChangesAsync();

        return await ObterCarrinhoPorUsuarioAsync(usuarioId); /* retorna carrinho atualizado */
    }

    /* usuarioId = de quem é o carrinho, produtoId = qual produto deve ser removido */
    public async Task<CarrinhoResponse?> RemoverItemAsync(int usuarioId, int produtoId)
    {
        var carrinho = await _context.Carrinhos
            .Include(carrinho => carrinho.Itens) /* carrega os itens */
            .FirstOrDefaultAsync(carrinho => carrinho.UsuarioId == usuarioId);

        if (carrinho is null)
        {
            return null;
        }

        var item = carrinho.Itens
            .FirstOrDefault(item => item.ProdutoId == produtoId);

        if (item is null)
        {
            return null;
        }

        _context.ItensCarrinho.Remove(item); /* dizendo para o banco que esse que vai ser deletado */

        await _context.SaveChangesAsync(); /* deleta the fato */

        return await ObterCarrinhoPorUsuarioAsync(usuarioId);
    }

    public async Task<CarrinhoResponse?> AtualizarQuantidadeAsync(int usuarioId, int produtoId, AtualizarQuantidadeItemRequest request)
    {
        var carrinho = await _context.Carrinhos
            .Include(carrinho => carrinho.Itens)
            .FirstOrDefaultAsync(carrinho => carrinho.UsuarioId == usuarioId);

        if (carrinho is null)
        {
            return null;
        }

        var item = carrinho.Itens
            .FirstOrDefault(item => item.ProdutoId == produtoId);

        if (item is null)
        {
            return null;
        }

        if (request.Quantidade <= 0)
        {
            _context.ItensCarrinho.Remove(item);
        }
        else
        {
            var produto = await _context.Produtos
                .FirstOrDefaultAsync(produto => produto.Id == produtoId);

            if (produto is null || request.Quantidade > produto.Estoque)
            {
                return null;
            }

            item.Quantidade = request.Quantidade;
        }

        await _context.SaveChangesAsync();

        return await ObterCarrinhoPorUsuarioAsync(usuarioId);
    }

    /* tira todos itens do carrinho */
    public async Task<CarrinhoResponse?> LimparCarrinhoAsync(int usuarioId)
    {
        var carrinho = await _context.Carrinhos
            .Include(carrinho => carrinho.Itens)
            .FirstOrDefaultAsync(carrinho => carrinho.UsuarioId == usuarioId);

        if (carrinho is null)
        {
            return null;
        }

        _context.ItensCarrinho.RemoveRange(carrinho.Itens); /* tipo um for de remoção de itens */

        await _context.SaveChangesAsync();

        return await ObterCarrinhoPorUsuarioAsync(usuarioId);
    }

    public async Task<FinalizarCompraResult> FinalizarCompraAsync(int usuarioId, FinalizarCompraRequest request)
    {
        await using var transaction = await _context.Database.BeginTransactionAsync();

        var carrinho = await _context.Carrinhos
            .Include(carrinho => carrinho.Itens)
            .FirstOrDefaultAsync(carrinho => carrinho.UsuarioId == usuarioId);

        if (carrinho is null)
        {
            return new FinalizarCompraResult
            {
                Sucesso = false,
                Mensagem = "Carrinho não encontrado."
            };
        }

        if (carrinho.Itens.Count == 0)
        {
            return new FinalizarCompraResult
            {
                Sucesso = false,
                Mensagem = "Seu carrinho está vazio."
            };
        }

        if (carrinho.Itens.Any(item => item.Quantidade <= 0))
        {
            return new FinalizarCompraResult
            {
                Sucesso = false,
                Mensagem = "Existe um item com quantidade inválida no carrinho."
            };
        }

        var itensAgrupados = carrinho.Itens
            .GroupBy(item => item.ProdutoId)
            .Select(grupo => new
            {
                ProdutoId = grupo.Key,
                Quantidade = grupo.Sum(item => item.Quantidade)
            })
            .ToList();

        var produtoIds = itensAgrupados.Select(item => item.ProdutoId).ToList();
        var produtos = await _context.Produtos
            .Where(produto => produtoIds.Contains(produto.Id))
            .ToDictionaryAsync(produto => produto.Id);

        foreach (var item in itensAgrupados)
        {
            if (!produtos.TryGetValue(item.ProdutoId, out var produto))
            {
                return new FinalizarCompraResult
                {
                    Sucesso = false,
                    Mensagem = "Um produto do carrinho não existe mais."
                };
            }

            if (produto.Estoque <= 0)
            {
                return new FinalizarCompraResult
                {
                    Sucesso = false,
                    Mensagem = $"O produto {produto.Nome} está esgotado."
                };
            }

            if (item.Quantidade > produto.Estoque)
            {
                return new FinalizarCompraResult
                {
                    Sucesso = false,
                    Mensagem = $"Estoque insuficiente para {produto.Nome}. Disponível: {produto.Estoque}."
                };
            }
        }

        foreach (var item in itensAgrupados)
        {
            produtos[item.ProdutoId].Estoque -= item.Quantidade;
        }

        var subtotal = itensAgrupados.Sum(item => produtos[item.ProdutoId].Preco * item.Quantidade);
        var pedido = new Pedido
        {
            UsuarioId = usuarioId,
            Data = DateTime.UtcNow,
            MetodoPagamento = request.MetodoPagamento.Trim(),
            Cep = request.Cep.Trim(),
            FreteLabel = request.FreteLabel.Trim(),
            FreteValor = request.FreteValor,
            CupomCodigo = string.IsNullOrWhiteSpace(request.CupomCodigo) ? null : request.CupomCodigo.Trim(),
            Desconto = request.Desconto,
            Parcelas = request.Parcelas <= 0 ? 1 : request.Parcelas,
            Juros = request.Juros,
            Subtotal = subtotal,
            Total = request.Total,
            Status = "Recebido",
            Itens = itensAgrupados.Select(item =>
            {
                var produto = produtos[item.ProdutoId];

                return new ItemPedido
                {
                    ProdutoId = produto.Id,
                    Nome = produto.Nome,
                    ImagemUrl = produto.ImagemUrl,
                    PrecoUnitario = produto.Preco,
                    Quantidade = item.Quantidade,
                    Subtotal = produto.Preco * item.Quantidade
                };
            }).ToList()
        };

        _context.Pedidos.Add(pedido);
        _context.ItensCarrinho.RemoveRange(carrinho.Itens);

        await _context.SaveChangesAsync();
        await transaction.CommitAsync();

        return new FinalizarCompraResult
        {
            Sucesso = true,
            Mensagem = "Compra finalizada com sucesso.",
            Carrinho = await ObterCarrinhoPorUsuarioAsync(usuarioId),
            Pedido = MapPedidoResponse(pedido)
        };
    }

    private static PedidoResponse MapPedidoResponse(Pedido pedido)
    {
        return new PedidoResponse
        {
            Id = pedido.Id,
            UsuarioId = pedido.UsuarioId,
            UsuarioNome = pedido.Usuario?.Nome ?? string.Empty,
            UsuarioEmail = pedido.Usuario?.Email ?? string.Empty,
            Data = pedido.Data,
            MetodoPagamento = pedido.MetodoPagamento,
            Cep = pedido.Cep,
            FreteLabel = pedido.FreteLabel,
            FreteValor = pedido.FreteValor,
            CupomCodigo = pedido.CupomCodigo,
            Desconto = pedido.Desconto,
            Parcelas = pedido.Parcelas,
            Juros = pedido.Juros,
            Subtotal = pedido.Subtotal,
            Total = pedido.Total,
            Status = pedido.Status,
            Itens = pedido.Itens.Select(item => new PedidoItemResponse
            {
                ProdutoId = item.ProdutoId,
                Nome = item.Nome,
                ImagemUrl = item.ImagemUrl,
                PrecoUnitario = item.PrecoUnitario,
                Quantidade = item.Quantidade,
                Subtotal = item.Subtotal
            }).ToList()
        };
    }
}
