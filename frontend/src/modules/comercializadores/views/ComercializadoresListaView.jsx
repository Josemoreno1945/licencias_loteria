import React, { useState } from 'react'
import { CContainer, CCard } from '@coreui/react'
import { useNavigate } from 'react-router-dom'
import useFetch from '../../../hooks/useFetch'
import ComercializadoresTabla from '../components/ComercializadoresTabla'
import RepresentantesModal from '../components/RepresentantesModal'
import PermisosModal from '../components/PermisosModal'

const ComercializadoresListaView = () => {
  const navigate = useNavigate()

  const { data: comercializadores, loading, error, refetch } = useFetch('/comercializadores')
  const [user] = useState(() => {
    const stored = localStorage.getItem('user')
    try {
      return stored && stored !== 'undefined' ? JSON.parse(stored) : null
    } catch (e) {
      return null
    }
  })

  const [repModal, setRepModal] = useState({ visible: false, comercializador: null })
  const [permisosModal, setPermisosModal] = useState({ visible: false, comercializador: null })

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

  return (
    <CContainer fluid>
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
