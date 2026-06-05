import React, { useState, useEffect } from 'react';
import { X, Calendar, Clipboard, User, CheckCircle, Clock } from 'lucide-react';
import Swal from 'sweetalert2';

export default function HerramientasHistorialPopup({ herramienta, onClose, onRefresh }) {
  const [historial, setHistorial] = useState([]);
  const [voluntarios, setVoluntarios] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Form States for Loan
  const [selectedVoluntario, setSelectedVoluntario] = useState('');
  const [notasPrestamo, setNotasPrestamo] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form States for Return
  const [notasDevolucion, setNotasDevolucion] = useState('');
  const [activePrestamo, setActivePrestamo] = useState(null);

  const fetchHistorial = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/herramientas/${herramienta.id}/prestamos`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      if (data.status === 'Success') {
        setHistorial(data.data);
        // Find if there is an active loan
        const active = data.data.find(p => p.estado_prestamo === 'prestado');
        setActivePrestamo(active || null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchVoluntarios = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/users', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      setVoluntarios(data || []);
      if (data && data.length > 0) {
        setSelectedVoluntario(data[0].id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchHistorial();
    fetchVoluntarios();
  }, [herramienta.id]);

  const handlePrestar = async (e) => {
    e.preventDefault();
    if (!selectedVoluntario) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('http://localhost:5000/api/herramientas/prestamos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          herramientaId: herramienta.id,
          userId: selectedVoluntario,
          notas: notasPrestamo
        })
      });
      const data = await res.json();
      if (res.ok && data.status === 'Success') {
        Swal.fire({
          icon: 'success',
          title: 'Préstamo Registrado',
          text: 'La herramienta ha sido asignada correctamente.',
          timer: 2000
        });
        setNotasPrestamo('');
        fetchHistorial();
        onRefresh();
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: data.error || 'No se pudo realizar el préstamo.',
          timer: 2000
        });
      }
    } catch (err) {
      console.error(err);
      Swal.fire({ icon: 'error', title: 'Error de Red' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDevolucion = async (e) => {
    e.preventDefault();
    if (!activePrestamo) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(`http://localhost:5000/api/herramientas/prestamos/${activePrestamo.id}/devolucion`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          notas: notasDevolucion
        })
      });
      const data = await res.json();
      if (res.ok && data.status === 'Success') {
        Swal.fire({
          icon: 'success',
          title: 'Devolución Registrada',
          text: 'La herramienta vuelve a estar disponible.',
          timer: 2000
        });
        setNotasDevolucion('');
        fetchHistorial();
        onRefresh();
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: data.error || 'No se pudo registrar la devolución.',
          timer: 2000
        });
      }
    } catch (err) {
      console.error(err);
      Swal.fire({ icon: 'error', title: 'Error de Red' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (isoString) => {
    if (!isoString) return '-';
    const d = new Date(isoString);
    return d.toLocaleString('es-CL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="herramientas-modal-overlay" onClick={onClose}>
      <div className="herramientas-modal large-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '800px', width: '90%' }}>
        <div className="herramientas-modal-header">
          <h2>Trazabilidad: {herramienta.nombre}</h2>
          <button type="button" className="herramientas-modal-close" onClick={onClose}>×</button>
        </div>

        <div className="herramientas-modal-body" style={{ maxHeight: '80vh', overflowY: 'auto', padding: '1.5rem' }}>
          
          {/* Fila superior: Acciones rápidas (Lending / Returning) */}
          <div className="loan-action-section" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem', marginBottom: '2rem', background: '#f8f9fc', padding: '1.25rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
            {activePrestamo ? (
              <form onSubmit={handleDevolucion} style={{ width: '100%' }}>
                <h3 style={{ fontSize: '0.95rem', color: '#e53e3e', fontWeight: '700', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Clock size={16} /> Registrar Devolución (En uso por: {activePrestamo.voluntario_nombre})
                </h3>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                  <div style={{ flex: '1', minWidth: '250px' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: '700', color: '#4a5568', display: 'block', marginBottom: '0.25rem' }}>Notas de recepción / Estado de la herramienta</label>
                    <input 
                      type="text" 
                      placeholder="Ej. Devuelto en buen estado sin detalles"
                      value={notasDevolucion}
                      onChange={(e) => setNotasDevolucion(e.target.value)}
                      style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e0', fontSize: '0.85rem' }}
                    />
                  </div>
                  <button type="submit" className="btn-primary" disabled={isSubmitting} style={{ background: '#e53e3e', padding: '0.55rem 1.25rem' }}>
                    {isSubmitting ? 'Procesando...' : 'Devolver Herramienta'}
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handlePrestar} style={{ width: '100%' }}>
                <h3 style={{ fontSize: '0.95rem', color: '#2b6cb0', fontWeight: '700', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircle size={16} /> Prestar Herramienta (Disponible actualmente)
                </h3>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                  <div style={{ flex: '1', minWidth: '200px' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: '700', color: '#4a5568', display: 'block', marginBottom: '0.25rem' }}>Asignar a Voluntario</label>
                    <select 
                      value={selectedVoluntario}
                      onChange={(e) => setSelectedVoluntario(e.target.value)}
                      style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e0', fontSize: '0.85rem', background: '#fff' }}
                      required
                    >
                      {voluntarios.map(v => (
                        <option key={v.id} value={v.id}>{v.name} ({v.role_nombre || 'Usuario'})</option>
                      ))}
                    </select>
                  </div>
                  <div style={{ flex: '1', minWidth: '200px' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: '700', color: '#4a5568', display: 'block', marginBottom: '0.25rem' }}>Notas de Entrega</label>
                    <input 
                      type="text" 
                      placeholder="Ej. Entregado con caja y accesorios"
                      value={notasPrestamo}
                      onChange={(e) => setNotasPrestamo(e.target.value)}
                      style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e0', fontSize: '0.85rem' }}
                    />
                  </div>
                  <button type="submit" className="btn-primary" disabled={isSubmitting} style={{ padding: '0.55rem 1.25rem' }}>
                    {isSubmitting ? 'Procesando...' : 'Asignar Préstamo'}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Historial de Préstamos */}
          <h3 style={{ fontSize: '1.05rem', fontWeight: '700', color: '#1e3a5f', marginBottom: '1rem' }}>Historial Completo de Uso</h3>
          
          {loading ? (
            <p style={{ textAlign: 'center', padding: '1rem', color: '#718096' }}>Cargando bitácora...</p>
          ) : historial.length === 0 ? (
            <p style={{ textAlign: 'center', padding: '2rem', color: '#718096', background: '#f7fafc', borderRadius: '8px' }}>Esta herramienta aún no tiene registros de uso.</p>
          ) : (
            <div className="inventario-table" style={{ border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead style={{ background: '#f7fafc', borderBottom: '1px solid #e2e8f0' }}>
                  <tr>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: '600' }}>VOLUNTARIO</th>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: '600' }}>FECHA PRÉSTAMO</th>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: '600' }}>FECHA DEVOLUCIÓN</th>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: '600' }}>ESTADO</th>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: '600' }}>NOTAS / OBSERVACIÓN</th>
                  </tr>
                </thead>
                <tbody>
                  {historial.map((loan) => (
                    <tr key={loan.id} style={{ borderBottom: '1px solid #edf2f7' }}>
                      <td style={{ padding: '0.75rem 1rem', fontWeight: '500' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <User size={14} color="#718096" />
                          <div>
                            <div>{loan.voluntario_nombre}</div>
                            <div style={{ fontSize: '0.7rem', color: '#a0aec0' }}>{loan.voluntario_email}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#4a5568' }}>
                          <Calendar size={13} />
                          {formatDate(loan.fecha_prestamo)}
                        </div>
                      </td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#4a5568' }}>
                          <Calendar size={13} />
                          {formatDate(loan.fecha_devolucion)}
                        </div>
                      </td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <span style={{ 
                          display: 'inline-block', 
                          padding: '0.2rem 0.5rem', 
                          borderRadius: '100px', 
                          fontSize: '0.7rem', 
                          fontWeight: '700', 
                          textTransform: 'uppercase',
                          background: loan.estado_prestamo === 'prestado' ? '#fff5f5' : '#e6fffa',
                          color: loan.estado_prestamo === 'prestado' ? '#e53e3e' : '#319795'
                        }}>
                          {loan.estado_prestamo === 'prestado' ? 'En Uso' : 'Devuelto'}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem 1rem', color: '#718096', fontStyle: loan.notas ? 'normal' : 'italic' }}>
                        {loan.notas || 'Sin observaciones'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
