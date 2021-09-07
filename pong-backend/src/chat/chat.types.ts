export interface Room
{
  id: number,
  name: string,
  ownerID: number,
  restricted: boolean,
  hash: string
}