using xablauBack.Application.Contracts.Pedidos;

namespace xablauBack.Application.Contracts.Carrinho;

public class FinalizarCompraResult
{
    public bool Sucesso { get; set; }
    public string Mensagem { get; set; } = string.Empty;
    public CarrinhoResponse? Carrinho { get; set; }
    public PedidoResponse? Pedido { get; set; }
}
