import React, { useState } from 'react'
import { CContainer, CCard } from '@coreui/react'
import { useNavigate } from 'react-router-dom'
import useFetch from '../../../hooks/useFetch'
import { useAuth } from '../../auth/store/AuthContext'
import ComercializadoresTabla from '../components/ComercializadoresTabla'
import ComercializadoresEditarModal from '../components/ComercializadoresEditarModal'
import ComercializadoresDetalleModal from '../components/ComercializadoresDetalleModal'
import RepresentantesModal from '../components/RepresentantesModal'
import PermisosModal from '../components/PermisosModal'

const ComercializadoresListaView = () => {
  const navigate = useNavigate()
  const { user } = useAuth()

  const { data: comercializadores, loading, error, refetch } = useFetch('/comercializadores')

  const [repModal, setRepModal] = useState({ visible: false, comercializador: null })
  const [permisosModal, setPermisosModal] = useState({ visible: false, comercializador: null })
  const [modalVerDetalleId, setModalVerDetalleId] = useState(null)
  const [modalEditarComercializadorId, setModalEditarComercializadorId] = useState(null)

  const [paginaActual, setPaginaActual] = useState(1)
  const PAGE_SIZE = 10
  const totalPaginas = comercializadores ? Math.ceil(comercializadores.length / PAGE_SIZE) : 0

  const handleVerRepresentantes = (comercializador) => {
    setRepModal({ visible: true, comercializador })
  }

  const handleVerPermisos = (comercializador) => {
    setPermisosModal({ visible: true, comercializador })
  }

  const handleRepresentanteCreado = () => {
    refetch()
  }

  const handlePermisoCreado = () => {
    refetch()
  }

  const handleEditar = (idComercializador) => {
    setModalEditarComercializadorId(idComercializador)
  }

  return (
     <CContainer fluid>
      <ComercializadoresDetalleModal
        idComercializador={modalVerDetalleId}
        onClose={() => setModalVerDetalleId(null)}
      />
      <ComercializadoresEditarModal
        idComercializador={modalEditarComercializadorId}
        onClose={() => setModalEditarComercializadorId(null)}
        onUpdated={refetch}
      />
      <CCard>
        <ComercializadoresTabla
          comercializadores={comercializadores}
          loading={loading}
          error={error}
          refetch={refetch}
          user={user}
          onNavegarRegistro={() => navigate('/comercializadores/registro')}
           onVerRepresentantes={handleVerRepresentantes}
           onVerPermisos={handleVerPermisos}
           onVerDetalle={(c) => setModalVerDetalleId(c.id_comercializadores)}
           onEditar={handleEditar}
           paginaActual={paginaActual}
          totalPaginas={totalPaginas}
          onPageChange={setPaginaActual}
        />
      </CCard>

      <RepresentantesModal
        visible={repModal.visible}
        comercializador={repModal.comercializador}
        user={user}
        onClose={() => setRepModal({ visible: false, comercializador: null })}
        onRepresentanteCreado={handleRepresentanteCreado}
      />

      <PermisosModal
        visible={permisosModal.visible}
        comercializador={permisosModal.comercializador}
        user={user}
        onClose={() => setPermisosModal({ visible: false, comercializador: null })}
        onPermisoCreado={handlePermisoCreado}
      />
    </CContainer>
  )
}

export default ComercializadoresListaView
