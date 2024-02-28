class ApiResponse {
  statusCode: number;
  message: string;
  data: any;
  constructor(statusCode: number, data: any, message = "Success") {
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;
  }
}

export { ApiResponse };
