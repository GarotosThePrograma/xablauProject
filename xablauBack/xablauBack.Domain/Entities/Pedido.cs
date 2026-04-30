namespace xablauBack.Domain.Entities;

public class Pedido
{
    public int Id { get; set; }
    public int UsuarioId { get; set; }
    public Usuario Usuario { get; set; } = null!;
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
    public string Status { get; set; } = "Recebido";
    public List<ItemPedido> Itens { get; set; } = new();
}
