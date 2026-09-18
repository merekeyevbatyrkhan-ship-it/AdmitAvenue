export class AiInsightsError extends Error {
  constructor(code,status=500){super(code);this.name='AiInsightsError';this.code=code;this.status=status;}
}
