// src/components/Tickets/TicketsManager.tsx
import React, { useEffect, useState } from "react";
import { apiClient } from "../../services/apiClient";

interface TicketsManagerProps {
  eventId: string;
  onBack: () => void;
}

const TicketsManager: React.FC<TicketsManagerProps> = ({ eventId, onBack }) => {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

useEffect(() => {
  const fetchTickets = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getTicketsByEvent(eventId);
      setTickets(response.payLoad || []); // adjust to your API response
    } catch (err) {
      console.error("❌ Failed to load tickets", err);
    } finally {
      setLoading(false);
    }
  };

  fetchTickets();
}, [eventId]);

    const handleDelete = async (ticketId: string) => {
    try {
        await apiClient.deleteTicket(ticketId);
        setTickets((prev) => prev.filter((t) => t.id !== ticketId)); // remove from UI
    } catch (err) {
        console.error("❌ Failed to delete ticket", err);
    }
    };
    const handleEdit = async (ticketId: string, updatedData: any) => {
    try {
        const response = await apiClient.updateTicket(ticketId, updatedData);
        setTickets((prev) =>
        prev.map((t) => (t.id === ticketId ? { ...t, ...response.payLoad } : t))
        ); // update in UI
    } catch (err) {
        console.error("❌ Failed to update ticket", err);
    }
    };

  return (
    <div>
      <h2>🎟 Tickets for Event {eventId}</h2>
      <button className="btn btn-secondary mb-3" onClick={onBack}>
        ⬅ Back to Events
      </button>

      {loading ? (
        <p>Loading tickets...</p>
      ) : tickets.length === 0 ? (
        <p>No tickets found.</p>
      ) : (
        <table className="table table-striped">
          <thead>
            <tr>
              <th>Ticket ID</th>
              <th>Name</th>
              <th>Price</th>
              <th>Quantity</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {tickets.map((ticket) => (
              <tr key={ticket.id}>
                <td>{ticket.id}</td>
                <td>{ticket.name}</td>
                <td>{ticket.price}</td>
                <td>{ticket.quantity}</td>
                <td>
                  <button className="btn btn-warning btn-sm">Edit</button>
                  <button className="btn btn-danger btn-sm ms-2">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default TicketsManager;
