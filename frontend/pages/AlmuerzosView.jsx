import React, { useState, useEffect } from 'react';
import { Search, X, Plus, Utensils } from 'lucide-react';
import TablaAlimentos from '../components/TablaAlimentos';
import FormularioAlimento from '../components/FormularioAlimento';

import { API_URL } from '../config.js';

const API = `${API_URL}/alimentos`;
const API_JORNADAS = `${API_URL}/jornadas/activas`;
const API_USERS = `${API_URL}/users`;

const ALIMENTO_VACIO = {
  nombre: '',
  cantidad: '',
  porciones: '',
  tipoDieta: 'Normal',
  jornadaId: null,
  encargado: null,
};

export default function AlmuerzosView({ user }) {
  const [alimentos, setAlimentos] = useState([]);
  const [jornadas, setJornadas] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [idEditar, setIdEditar] = useState(null);
  const [nuevoAlimento, setNuevoAlimento] = useState(ALIMENTO_VACIO);

  const token = localStorage.getItem('token');

  const cargarAlimentos = async () => {
    setLoading(true);
    try {
      const res = await fetch(API, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setAlimentos(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error cargando alimentos:', err);
      setAlimentos([]);
    } finally {
      setLoading(false);
    }
  };

  const cargarJornadas = async () => {
    try {
      const res = await fetch(API_JORNADAS, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setJornadas(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error cargando jornadas activas:', err);
      setJornadas([]);
    }
  };

  const cargarUsuarios = async () => {
    try {
      const res = await fetch(API_USERS, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setUsuarios(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error cargando usuarios:', err);
      setUsuarios([]);
    }
  };

  useEffect(() => {
    cargarAlimentos();
    cargarJornadas();
    cargarUsuarios();
  }, []);

  const handleCrearAlimento = async () => {
    if (!nuevoAlimento.nombre.trim()) return;
    try {
      await fetch(API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          nombre: nuevoAlimento.nombre,
          cantidad: Number(nuevoAlimento.cantidad),
          porciones: Number(nuevoAlimento.porciones),
          tipoDieta: nuevoAlimento.tipoDieta,
          jornadaId: nuevoAlimento.jornadaId ? Number(nuevoAlimento.jornadaId) : null,
          encargado: nuevoAlimento.encargado || null,
        }),
      });
      setNuevoAlimento(ALIMENTO_VACIO);
      setMostrarFormulario(false);
      cargarAlimentos();
    } catch (err) {
      console.error('Error creando alimento:', err);
    }
  };

  const handleEditarAlimento = (alimento) => {
    setModoEdicion(true);
    setIdEditar(alimento.id);
    setMostrarFormulario(true);

    // Buscar en las jornadas activas si este alimento está asignado a alguna
    const jornadaAsociada = jornadas.find((j) =>
      j.alimentos?.some((al) => al.id === alimento.id)
    );

    setNuevoAlimento({
      nombre: alimento.nombre,
      cantidad: alimento.cantidad,
      porciones: alimento.porciones,
      tipoDieta: alimento.tipoDieta,
      jornadaId: jornadaAsociada ? jornadaAsociada.id : '',
      encargado: alimento.encargado || '',
    });
  };

  const handleGuardarEdicion = async () => {
    try {
      await fetch(`${API}/${idEditar}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          nombre: nuevoAlimento.nombre,
          cantidad: Number(nuevoAlimento.cantidad),
          porciones: Number(nuevoAlimento.porciones),
          tipoDieta: nuevoAlimento.tipoDieta,
          jornadaId: nuevoAlimento.jornadaId ? Number(nuevoAlimento.jornadaId) : null,
          encargado: nuevoAlimento.encargado || null,
        }),
      });
      setModoEdicion(false);
      setIdEditar(null);
      setMostrarFormulario(false);
      setNuevoAlimento(ALIMENTO_VACIO);
      cargarAlimentos();
    } catch (err) {
      console.error('Error editando alimento:', err);
    }
  };

  const handleEliminarAlimento = async (id) => {
    try {
      await fetch(`${API}/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      cargarAlimentos();
    } catch (err) {
      console.error('Error eliminando alimento:', err);
    }
  };

  const alimentosFiltrados = alimentos.filter((a) =>
    a.nombre?.toLowerCase().includes(busqueda.toLowerCase())
  );

  // Stats
  const totalAlimentos = alimentos.length;
  const enJornada = alimentos.filter((a) => a.jornadaActiva).length;
  const disponibles = totalAlimentos - enJornada;
  const tiposDieta = [...new Set(alimentos.map((a) => a.tipoDieta))].length;

  const isAdmin = user?.role_id === 1;

  return (
    <div style={{ padding: '0' }}>
      {/* Header */}
      <div className="dashboard-header">
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Utensils size={28} /> Módulo de Almuerzos
          </h1>
          <p>Gestión de alimentos, porciones y tipos de dieta por jornada.</p>
        </div>
        {isAdmin && (
          <div className="header-actions">
            <button
              className="btn-primary"
              onClick={() => {
                setMostrarFormulario(!mostrarFormulario);
                if (modoEdicion) {
                  setModoEdicion(false);
                  setIdEditar(null);
                  setNuevoAlimento(ALIMENTO_VACIO);
                }
              }}
            >
              {mostrarFormulario
                ? <><X size={16} /> Cancelar</>
                : <><Plus size={16} /> Nuevo Alimento</>
              }
            </button>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: '1.5rem' }}>
        <div className="kpi-card blue">
          <div className="kpi-body">
            <p className="kpi-label">TOTAL ALIMENTOS</p>
            <h2>{totalAlimentos}</h2>
            <p className="kpi-sub">Registrados en el sistema</p>
          </div>
        </div>
        <div className="kpi-card blue">
          <div className="kpi-body">
            <p className="kpi-label">DISPONIBLES</p>
            <h2>{disponibles}</h2>
            <p className="kpi-sub">Listos para asignar</p>
          </div>
        </div>
        <div className="kpi-card brown">
          <div className="kpi-body">
            <p className="kpi-label">EN JORNADA</p>
            <h2>{enJornada}</h2>
            <p className="kpi-sub">Activos en terreno</p>
          </div>
        </div>
        <div className="kpi-card blue">
          <div className="kpi-body">
            <p className="kpi-label">TIPOS DE DIETA</p>
            <h2>{tiposDieta}</h2>
            <p className="kpi-sub">Variedad registrada</p>
          </div>
        </div>
      </div>

      {/* Formulario */}
      {mostrarFormulario && isAdmin && (
        <div className="card" style={{ marginBottom: '1.5rem', padding: '1.5rem' }}>
          <h3 style={{ marginBottom: '1rem', color: '#1a1a2e', fontWeight: 700 }}>
            {modoEdicion ? '✏️ Editar Alimento' : '➕ Nuevo Alimento'}
          </h3>
          <FormularioAlimento
            nuevoAlimento={nuevoAlimento}
            setNuevoAlimento={setNuevoAlimento}
            crearAlimento={handleCrearAlimento}
            guardarEdicion={handleGuardarEdicion}
            modoEdicion={modoEdicion}
            jornadas={jornadas}
            usuarios={usuarios}
          />
        </div>
      )}

      {/* Search bar */}
      <div className="card" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h3 style={{ color: '#1a1a2e', fontWeight: 700 }}>Inventario de Alimentos</h3>
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#868e96' }} />
            <input
              type="text"
              placeholder="Buscar alimento..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              style={{
                paddingLeft: '34px',
                paddingRight: busqueda ? '34px' : '12px',
                padding: '8px 12px 8px 34px',
                borderRadius: '8px',
                border: '1px solid #dee2e6',
                outline: 'none',
                fontSize: '14px',
                width: '250px',
              }}
            />
            {busqueda && (
              <button
                onClick={() => setBusqueda('')}
                style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'transparent', cursor: 'pointer', color: '#868e96' }}
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <p style={{ textAlign: 'center', color: '#868e96', padding: '2rem' }}>Cargando alimentos...</p>
        ) : alimentosFiltrados.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#868e96', padding: '2rem' }}>
            {busqueda ? 'No se encontraron alimentos con ese nombre.' : 'No hay alimentos registrados aún.'}
          </p>
        ) : (
          <TablaAlimentos
            alimentos={alimentosFiltrados}
            user={user}
            eliminarAlimento={handleEliminarAlimento}
            editarAlimento={handleEditarAlimento}
          />
        )}
      </div>
    </div>
  );
}
