namespace xablauBack.Application.Contracts.Pedidos;

public class PedidoResponse
{
    public int Id { get; set; }
    public int UsuarioId { get; set; }
    public string UsuarioNome { get; set; } = string.Empty;
    public string UsuarioEmail { get; set; } = string.Empty;
    public DateTime Data { get; set; }
    public string MetodoPagamento { get; set; } = string.Empty;
    public string Cep { get; set; } = string.Empty;
    public string FreteLabel { get; set; } = string.Empty;
    public decimal FreteValor { get; set; }
    public string? CupomCodigo { get; set; }
    public decimal Desconto { get; set; }
    public int Parcelas { get; set; }
    public decimal Juros { get; set; }
    public decimal Subtotal { get; set; }
    public decimal Total { get; set; }
    public string Status { get; set; } = string.Empty;
    public List<PedidoItemResponse> Itens { get; set; } = new();
}
