import { useState, useCallback } from "react";
import { CCard, CCardBody, CCardHeader, CContainer } from "@coreui/react";
import { createBanco } from "../services/bancos.service";
import FeedbackModal from "../../../components/FeedbackModal";
import BancosForm from "../components/BancosForm";
import { extractErrorMessage } from "../../../utils/errorHandler";

const BancosRegistroView = () => {
  const [formData, setFormData] = useState({
    nombre: "",
    codigo: "",
    estado: "activo",
  });

  const [modalState, setModalState] = useState({
    visible: false,
    type: "",
    message: "",
  });

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setModalState({
      visible: true,
      type: "loading",
      message: "Registrando banco...",
    });

    try {
      const response = await createBanco(formData);

      setModalState({
        visible: true,
        type: "success",
        message: response.message || "Banco registrado exitosamente.",
      });

      setFormData({
        nombre: "",
        codigo: "",
        estado: "activo",
      });
    } catch (err) {
      const errorMsg = extractErrorMessage(
        err,
        "Ocurrio un error inesperado al registrar el banco.",
      );

      setModalState({
        visible: true,
        type: "error",
        message: errorMsg,
      });
    }
  };

  return (
    <CContainer fluid>
      <FeedbackModal
        visible={modalState.visible}
        type={modalState.type}
        message={modalState.message}
        onClose={() => setModalState((prev) => ({ ...prev, visible: false }))}
      />

      <CCard className="mb-4 shadow-sm border-top-primary border-top-3">
        <CCardHeader className="bg-white pb-0">
          <h4 className="mb-3 text-primary">Registro de Bancos</h4>
          <p className="text-muted small">
            Ingrese los datos del banco para registrarlo en el catalogo del
            sistema.
          </p>
        </CCardHeader>
        <CCardBody>
          <BancosForm
            formData={formData}
            handleInputChange={handleInputChange}
            onSubmit={handleSubmit}
          />
        </CCardBody>
      </CCard>
    </CContainer>
  );
};

export default BancosRegistroView;