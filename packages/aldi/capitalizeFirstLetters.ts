export function capitalizeFirstLetters(string: string): string {
  const words = string.split(' ');
  const capitalizedWords = words.map((word) => word.charAt(0).toUpperCase() + word.slice(1));
  let result = '';
  capitalizedWords.forEach((word) => {
    result += `${word} `;
  });
  result += ' ';
  return result;
}
