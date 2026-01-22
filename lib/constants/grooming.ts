export const BLADE_SIZES = [
  { value: '3f', label: '3f (13mm) - Longer Body' },
  { value: '4f', label: '4f (10mm) - Winter Trim' },
  { value: '5f', label: '5f (6mm) - Short Puppy Cut' },
  { value: '7f', label: '7f (3mm) - Summer Cut / Matted' },
  { value: '10', label: '10 (1.8mm) - Sanitary / Paws' },
  { value: '15', label: '15 (1.2mm) - Pads' },
  { value: '30', label: '30 (0.5mm) - Under Comb' },
  { value: 'custom', label: 'Custom (see notes)' },
] as const;

export type BladeSizeValue = typeof BLADE_SIZES[number]['value'];

/**
 * Returns the descriptive label for a given blade size value.
 */
export function getBladeSizeLabel(value: string | null | undefined): string {
  if (!value) return 'Not specified';
  const size = BLADE_SIZES.find(s => s.value === value);
  return size ? size.label : value;
}
