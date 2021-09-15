export class AvatarError extends Error {
  constructor(message) {
    super(message); // (1)
    this.name = "AvatarError"; // (2)
  } 
}