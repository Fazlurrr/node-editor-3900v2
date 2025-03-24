using Microsoft.AspNetCore.Mvc;
using server.Models;
using server.DAL;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;

namespace server.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class EdgesController(DB db, ILogger<EdgesController> logger) : Controller
{
    private readonly DB _db = db;
    private readonly ILogger<EdgesController> _logger = logger;

    [HttpGet("{id}/all")]
    public async Task<ActionResult<IEnumerable<Edge>>> FetchEdges(string id)
    {
        try
        {
            var edges = await _db.Edges.Include(b => b.Data)
                .Where(b => b.Data.CreatedBy == id).ToListAsync();
            return Ok(edges);
        }
        catch (DbUpdateException dbEx)
        {
            _logger.LogError("[EdgesController]: Database fetch failed: {Error}", dbEx.Message);
            return StatusCode(500, "Failed to fetch edges due to database error.");
        }
        catch (Exception e)
        {
            _logger.LogError("[EdgesController]: Failed to fetch edges: {Error}", e.Message);
            return StatusCode(500, "An unexpected error occurred.");
        }
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> FetchEdge(string id)
    {
        try
        {
            var edge = await _db.Edges.FindAsync(id);

            if (edge == null)
            {
                throw new Exception("Edge with id " + id + " does not exist");
            }

            return Ok(edge);
        }
        catch (DbUpdateException dbEx)
        {
            _logger.LogError("[EdgesController]: Database fetch failed: {Error}", dbEx.Message);
            return StatusCode(500, "Failed to fetch edges due to database error.");
        }
        catch (Exception e)
        {
            _logger.LogError("[EdgesController]: Failed to fetch edges: {Error}", e.Message);
            return StatusCode(500, "An unexpected error occurred.");
        }
    }

    [HttpPost("upload")]
    public async Task<IActionResult> UploadEdges(IEnumerable<Edge> edges)
    {
        if (edges == null) return BadRequest("Edges data is missing.");

        try
        {
            await _db.Edges.AddRangeAsync(edges);
            await _db.SaveChangesAsync();

            return Ok();
        }
        catch (DbUpdateException dbEx)
        {
            _logger.LogError("[EdgesController]: Database update failed: {Error}", dbEx.Message);
            return StatusCode(500, "Failed to save edges data due to database error.");
        }
        catch (Exception e)
        {
            _logger.LogError("[EdgesController]: Failed to create edges: {Error}", e.Message);
            return StatusCode(500, "An unexpected error occurred.");
        }
    }

    [HttpPost]
    public async Task<IActionResult> CreateEdge(Edge edge)
    {
        if (edge == null) return BadRequest("Edge data is missing.");

        try
        {
            await _db.Edges.AddAsync(edge);
            await _db.SaveChangesAsync();

            return CreatedAtAction(nameof(FetchEdge), new { id = edge.Id }, edge);
        }
        catch (DbUpdateException dbEx)
        {
            _logger.LogError("[EdgesController]: Database update failed: {Error}", dbEx.Message);
            Console.WriteLine(dbEx.InnerException);
            return StatusCode(500, "Failed to save edge data due to database error.");
        }
        catch (Exception e)
        {
            _logger.LogError("[EdgesController]: Failed to create edge: {Error}", e.Message);
            return StatusCode(500, "An unexpected error occurred.");
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteEdge(string id)
    {
        if (id == null) return BadRequest("Edge id is missing.");

        try
        {
            var edge = await _db.Edges.FindAsync(id);

            if (edge == null)
            {
                throw new Exception("Edge with id " + id + " does not exist");
            }

            _db.Edges.Remove(edge);
            await _db.SaveChangesAsync();

            return Ok("Edge with id " + id + " has been deleted.");
        }
        catch (DbUpdateException dbEx)
        {
            _logger.LogError("[EdgesController]: Database deletion failed: {Error}", dbEx.Message);
            return StatusCode(500, "Failed to delete edge due to database error.");
        }
        catch (Exception e)
        {
            _logger.LogError("[EdgesController]: Failed to delete edge with id {id}: {e}", id, e.Message);
            return StatusCode(500, "An unexpected error occurred.");
        }
    }
    [HttpDelete("{id}/all")]
    public async Task<IActionResult> DeleteEdges(string id)
    {
        if (id == null) return BadRequest("Edge id is missing.");

        try
        {
            var edges = await _db.Edges.Where(b => b.Data.CreatedBy == id).ToListAsync();

            if (edges == null)
            {
                throw new Exception("Edges with id " + id + " do not exist");
            }

            _db.Edges.RemoveRange(edges);
            await _db.SaveChangesAsync();

            return Ok("Edges with id " + id + " have been deleted.");
        }
        catch (DbUpdateException dbEx)
        {
            _logger.LogError("[EdgesController]: Database deletion failed: {Error}", dbEx.Message);
            return StatusCode(500, "Failed to delete edges due to database error.");
        }
        catch (Exception e)
        {
            _logger.LogError("[EdgesController]: Failed to delete edges with id {id}: {e}", id, e.Message);
            return StatusCode(500, "An unexpected error occurred.");
        }
    }

    [HttpPut]
    public async Task<IActionResult> UpdateEdge(Edge edge)
    {
        if (edge == null) return BadRequest("Edge data is missing.");

        try
        {
            _db.Edges.Update(edge);
            await _db.SaveChangesAsync();

            return CreatedAtAction(nameof(FetchEdge), new { id = edge.Id }, edge);
        }
        catch (DbUpdateException dbEx)
        {
            _logger.LogError("[EdgesController]: Database update failed: {Error}", dbEx.Message);
            return StatusCode(500, "Failed to update edge data due to database error.");
        }
        catch (Exception e)
        {
            _logger.LogError("[EdgesController]: Failed to update edge: {Error}", e.Message);
            return StatusCode(500, "An unexpected error occurred.");
        }
    }

    [HttpDelete("delete-by-ids")]
    public async Task<IActionResult> DeleteEdgesBulk([FromBody] List<string> edgeIds)
    {
        if (edgeIds == null || !edgeIds.Any())
        {
            return BadRequest("No edge IDs provided.");
        }

        try
        {
            var edgesToDelete = await _db.Edges.Where(e => edgeIds.Contains(e.Id)).ToListAsync();
            if (edgesToDelete == null || !edgesToDelete.Any())
            {
                return NotFound("No edges found for the provided IDs.");
            }

            _db.Edges.RemoveRange(edgesToDelete);
            await _db.SaveChangesAsync();

            return Ok("Selected edges have been deleted.");
        }
        catch (DbUpdateException dbEx)
        {
            _logger.LogError("[EdgesController]: Bulk deletion failed: {Error}", dbEx.Message);
            return StatusCode(500, "Failed to delete edges due to a database error.");
        }
        catch (Exception e)
        {
            _logger.LogError("[EdgesController]: Bulk deletion failed: {Error}", e.Message);
            return StatusCode(500, "An unexpected error occurred.");
        }
    }

}
