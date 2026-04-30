namespace xablauBack.Application.Contracts.Pedidos;

public class PedidoItemResponse
{
    public int ProdutoId { get; set; }
    public string Nome { get; set; } = string.Empty;
    public string ImagemUrl { get; set; } = string.Empty;
    public decimal PrecoUnitario { get; set; }
    public int Quantidade { get; set; }
    public decimal Subtotal { get; set; }
}
