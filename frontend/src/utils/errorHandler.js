export const extractErrorMessage = (err, defaultMessage = 'Ocurrió un error inesperado.') => {
  if (err.response?.data) {
    const data = err.response.data;
    
    // Si el backend envía un array de errores (ej. validación Zod)
    if (data.errors && Array.isArray(data.errors)) {
      // Retornamos el array directamente para que FeedbackModal lo renderice como lista (<ul>)
      return data.errors.map((issue) => issue.message || issue);
    }
    
    // Si el backend envía un error específico en formato string
    if (data.error) {
      return data.error;
    }
    
    // Si el backend envía un mensaje genérico
    if (data.message) {
      return data.message;
    }
  }
  
  return err.message || defaultMessage;
};
