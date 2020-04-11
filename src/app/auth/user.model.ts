export class User {
  constructor(
    private accessToken: string,
    private expiresIn: Date,
    private refreshToken: string
  ) {
  }

  get token() {
    if (!this.expiresIn || new Date() > this.expiresIn) {
      return null;
    }
    return this.accessToken;
  }
}
