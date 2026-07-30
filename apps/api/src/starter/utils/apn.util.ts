export function GetApnDifference(apn1: string, apn2: string): number {
    const n1 = parseInt(apn1.replace(/\D/g, ''), 10);
    const n2 = parseInt(apn2.replace(/\D/g, ''), 10);
    if (!isNaN(n1) && !isNaN(n2)) {
      return Math.abs(n1 - n2);
    }
    return apn1.toLowerCase() === apn2.toLowerCase() ? 0 : Infinity;
  }