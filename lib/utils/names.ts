/**
 * lib/utils/names.ts
 * Utilidades para procesamiento de nombres de personas y generación de nombres de grupos familiares.
 */

/**
 * Extrae el apellido representativo de un nombre completo en español.
 * Soporta prefijos comunes como 'de', 'del', 'de la', 'de los', 'san', 'santa'.
 * Ejemplo: "Juan Pérez" -> "Pérez"
 *          "María Gómez" -> "Gómez"
 *          "Carlos del Valle" -> "del Valle"
 */
export function extractSurname(fullName: string): string {
  const clean = fullName.trim().replace(/\s+/g, ' ');
  if (!clean) return '';
  const parts = clean.split(' ');
  if (parts.length === 1) return parts[0];

  const lower = parts.map((p) => p.toLowerCase());
  const len = parts.length;

  if (len >= 3 && lower[len - 3] === 'de' && lower[len - 2] === 'la') {
    return parts.slice(len - 3).join(' ');
  }
  if (len >= 3 && lower[len - 3] === 'de' && lower[len - 2] === 'los') {
    return parts.slice(len - 3).join(' ');
  }
  if (
    len >= 2 &&
    (lower[len - 2] === 'de' ||
      lower[len - 2] === 'del' ||
      lower[len - 2] === 'san' ||
      lower[len - 2] === 'santa')
  ) {
    return parts.slice(len - 2).join(' ');
  }

  return parts[len - 1];
}

/**
 * Formatea una palabra para que tenga la primera letra mayúscula.
 */
function capitalizeWord(word: string): string {
  if (!word) return '';
  // Si contiene espacios (ej. "del Valle"), capitalizar cada palabra salvo conectores comunes
  if (word.includes(' ')) {
    return word
      .split(' ')
      .map((w, idx) => {
        const lw = w.toLowerCase();
        if (idx > 0 && ['de', 'del', 'la', 'los'].includes(lw)) {
          return lw;
        }
        return w.charAt(0).toUpperCase() + w.slice(1);
      })
      .join(' ');
  }
  return word.charAt(0).toUpperCase() + word.slice(1);
}

/**
 * Deriva un nombre de grupo familiar combinando los apellidos en el formato:
 * "Familia Apellido1 - Apellido2".
 *
 * Ejemplos:
 *  - ['Juan Pérez', 'María Gómez'] -> "Familia Pérez - Gómez"
 *  - ['Juan Pérez', 'Lucas Pérez'] -> "Familia Pérez"
 *  - ['Juan Pérez Gómez']          -> "Familia Pérez - Gómez"
 *  - ['Juan Carlos Rossi Nougués'] -> "Familia Rossi - Nougués"
 *  - ['Juan Pérez']                -> "Familia Pérez"
 */
export function deriveFamilyGroupName(members: string[]): string {
  const clean = (members || [])
    .map((m) => m.trim())
    .filter(Boolean);

  if (clean.length === 0) return 'Familia';

  // Si el usuario ya escribió "Familia ...", normalizar y respetar su entrada
  if (clean[0].toLowerCase().startsWith('familia ')) {
    return clean[0];
  }

  // 1. Caso: Se ingresaron al menos 2 integrantes
  if (clean.length >= 2) {
    const surname1 = extractSurname(clean[0]);
    const surname2 = extractSurname(clean[1]);

    if (surname1 && surname2) {
      if (surname1.toLowerCase() !== surname2.toLowerCase()) {
        return `Familia ${capitalizeWord(surname1)} - ${capitalizeWord(surname2)}`;
      }
      return `Familia ${capitalizeWord(surname1)}`;
    }
  }

  // 2. Caso: Solo 1 integrante ingresado
  const firstMember = clean[0];

  // Si tiene guión previo (ej: "Juan Pérez-Gómez" o "Pérez - Gómez")
  if (firstMember.includes('-')) {
    const hyphenParts = firstMember
      .split('-')
      .map((p) => extractSurname(p.trim()))
      .filter(Boolean);
    if (hyphenParts.length >= 2) {
      return `Familia ${capitalizeWord(hyphenParts[0])} - ${capitalizeWord(hyphenParts[1])}`;
    }
  }

  // Si tiene 3 o más palabras (ej: "Juan Pérez Gómez" o "Juan Carlos Rossi Nougués")
  const words = firstMember.split(' ').filter(Boolean);
  if (words.length >= 3) {
    const surname2 = words[words.length - 1];
    const surname1 = words[words.length - 2];
    return `Familia ${capitalizeWord(surname1)} - ${capitalizeWord(surname2)}`;
  }

  // Si solo tiene 1 o 2 palabras (ej: "Juan Pérez" o "Pérez")
  const singleSurname = extractSurname(firstMember);
  return `Familia ${capitalizeWord(singleSurname)}`;
}
