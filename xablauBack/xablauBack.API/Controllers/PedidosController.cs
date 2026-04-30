using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using xablauBack.Application.Contracts.Pedidos;
using xablauBack.Domain.Entities;
using xablauBack.Infrastructure.Data;

namespace xablauBack.API.Controllers;

[ApiController]
[Route("api/pedidos")]
public class PedidosController : ControllerBase
{
    private readonly AppDbContext _context;

    public PedidosController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> ListarTodos()
    {
        var pedidos = await _context.Pedidos
            .Include(pedido => pedido.Usuario)
            .Include(pedido => pedido.Itens)
            .OrderByDescending(pedido => pedido.Data)
            .ToListAsync();

        return Ok(pedidos.Select(MapPedidoResponse));
    }

    [HttpGet("usuario/{usuarioId:int}")]
    public async Task<IActionResult> ListarPorUsuario(int usuarioId)
    {
        var pedidos = await _context.Pedidos
            .Include(pedido => pedido.Usuario)
            .Include(pedido => pedido.Itens)
            .Where(pedido => pedido.UsuarioId == usuarioId)
            .OrderByDescending(pedido => pedido.Data)
            .ToListAsync();

        return Ok(pedidos.Select(MapPedidoResponse));
    }

    [HttpPatch("{pedidoId:int}/status")]
    public async Task<IActionResult> AtualizarStatus(int pedidoId, [FromBody] AtualizarStatusPedidoRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Status))
        {
            return BadRequest("Status obrigatório.");
        }

        var pedido = await _context.Pedidos
            .Include(pedido => pedido.Usuario)
            .Include(pedido => pedido.Itens)
            .FirstOrDefaultAsync(pedido => pedido.Id == pedidoId);

        if (pedido is null)
        {
            return NotFound("Pedido não encontrado.");
        }

        pedido.Status = request.Status.Trim();
        await _context.SaveChangesAsync();

        return Ok(MapPedidoResponse(pedido));
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

public class AtualizarStatusPedidoRequest
{
    public string Status { get; set; } = string.Empty;
}
