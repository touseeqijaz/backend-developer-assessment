export function validationError(details) {
    return {
      success: false,
      error: "Validation failed",
      details: details.map(d => ({ field: d.field, message: d.message })),
    };
  }
  
  export function fail(message) {
    return { success: false, error: message };
  }
  