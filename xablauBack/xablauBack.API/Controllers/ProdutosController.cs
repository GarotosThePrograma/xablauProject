using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using xablauBack.Domain.Entities;
using xablauBack.Infrastructure.Data;

namespace xablauBack.API.Controllers;

[ApiController]
[Route("api/produtos")]
public class ProdutosController : ControllerBase /* lista os produtos para o front exibir */
{
    private readonly AppDbContext _context;

    public ProdutosController(AppDbContext context)
    {
        _context = context; /* acessa a tabela de produtos */
    }

    [HttpGet]
    public async Task<IActionResult> Listar()
    {
        var produtos = await _context.Produtos
            .OrderBy(produto => produto.Id) /* ordena por id */
            .Select(produto => new /* transforma o produto do banco no formato que o front espera */
            {
                id = produto.Id,
                name = produto.Nome,
                price = produto.Preco,
                stock = produto.Estoque,
                img = produto.ImagemUrl,
            })
            .ToListAsync(); 

        return Ok(produtos);
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> ObterPorId(int id)
    {
        var produto = await _context.Produtos
            .Where(produto => produto.Id == id)
            .Select(produto => new
            {
                id = produto.Id,
                name = produto.Nome,
                description = produto.Descricao,
                price = produto.Preco,
                stock = produto.Estoque,
                img = produto.ImagemUrl,
            })
            .FirstOrDefaultAsync();

        if (produto is null)
        {
            return NotFound("Produto não encontrado");
        }

        return Ok(produto);
    }

    [HttpPost]
    public async Task<IActionResult> Criar([FromBody] ProdutoRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Nome))
        {
            return BadRequest("Nome obrigatório");
        }

        if (request.Estoque < 0)
        {
            return BadRequest("Estoque não pode ser negativo");
        }

        var produto = new Produto
        {
            Nome = request.Nome.Trim(),
            Descricao = string.IsNullOrWhiteSpace(request.Descricao) ? request.Nome.Trim() : request.Descricao.Trim(),
            Preco = request.Preco,
            Estoque = request.Estoque,
            ImagemUrl = request.ImagemUrl.Trim(),
        };

        _context.Produtos.Add(produto);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(ObterPorId), new { id = produto.Id }, new
        {
            id = produto.Id,
            name = produto.Nome,
            description = produto.Descricao,
            price = produto.Preco,
            stock = produto.Estoque,
            img = produto.ImagemUrl,
        });
    }

    [HttpPatch("{id:int}/estoque")]
    public async Task<IActionResult> AtualizarEstoque(int id, [FromBody] AtualizarEstoqueRequest request)
    {
        if (request.Estoque < 0)
        {
            return BadRequest("Estoque não pode ser negativo");
        }

        var produto = await _context.Produtos.FirstOrDefaultAsync(produto => produto.Id == id);

        if (produto is null)
        {
            return NotFound("Produto não encontrado");
        }

        produto.Estoque = request.Estoque;
        await _context.SaveChangesAsync();

        return Ok(new
        {
            id = produto.Id,
            name = produto.Nome,
            description = produto.Descricao,
            price = produto.Preco,
            stock = produto.Estoque,
            img = produto.ImagemUrl,
        });
    }

    [HttpPatch("{id:int}")]
    public async Task<IActionResult> Atualizar(int id, [FromBody] AtualizarProdutoRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Nome))
        {
            return BadRequest("Nome obrigatório");
        }

        if (string.IsNullOrWhiteSpace(request.ImagemUrl))
        {
            return BadRequest("URL da imagem obrigatória");
        }

        if (request.Preco < 0 || request.Estoque < 0)
        {
            return BadRequest("Preço e estoque não podem ser negativos");
        }

        var produto = await _context.Produtos.FirstOrDefaultAsync(produto => produto.Id == id);

        if (produto is null)
        {
            return NotFound("Produto não encontrado");
        }

        produto.Nome = request.Nome.Trim();
        produto.Descricao = string.IsNullOrWhiteSpace(request.Descricao) ? produto.Nome : request.Descricao.Trim();
        produto.Preco = request.Preco;
        produto.ImagemUrl = request.ImagemUrl.Trim();
        produto.Estoque = request.Estoque;

        await _context.SaveChangesAsync();

        return Ok(new
        {
            id = produto.Id,
            name = produto.Nome,
            description = produto.Descricao,
            price = produto.Preco,
            stock = produto.Estoque,
            img = produto.ImagemUrl,
        });
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Deletar(int id)
    {
        var produto = await _context.Produtos.FirstOrDefaultAsync(produto => produto.Id == id);

        if (produto is null)
        {
            return NotFound("Produto não encontrado");
        }

        _context.Produtos.Remove(produto);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}

public class ProdutoRequest
{
    public string Nome { get; set; } = string.Empty;
    public string Descricao { get; set; } = string.Empty;
    public decimal Preco { get; set; }
    public int Estoque { get; set; }
    public string ImagemUrl { get; set; } = string.Empty;
}

public class AtualizarEstoqueRequest
{
    public int Estoque { get; set; }
}

public class AtualizarProdutoRequest
{
    public string Nome { get; set; } = string.Empty;
    public string Descricao { get; set; } = string.Empty;
    public decimal Preco { get; set; }
    public int Estoque { get; set; }
    public string ImagemUrl { get; set; } = string.Empty;
}
