interface ValidationError {
  field: string;
  message: string;
  children?: ValidationError[];
}

function formatContactErrors(
  contactErrors: any[],
  contactIndex: number,
): ValidationError[] {
  return contactErrors.reduce((acc: ValidationError[], error) => {
    if (error && error.constraints) {
      acc.push({
        field: `contacts[${contactIndex}] - ${error.property}`,
        message: Object.values(error.constraints).join(', '),
      });
    }
    return acc;
  }, []);
}

function formatValidationErrors(errors: any[]): ValidationError[] {
  return errors.reduce((acc: ValidationError[], error) => {
    if (error.constraints) {
      acc.push({
        field: error.property,
        message: Object.values(error.constraints).join(', '),
      });
    } else if (error.property === 'contacts') {
      error.children.forEach((childError, index) => {
        acc.push(...formatContactErrors(childError, index));
      });
    }

    if (error.children && error.children.length > 0) {
      acc.push(...formatValidationErrors(error.children));
    }

    return acc;
  }, []);
}
export default formatValidationErrors;
