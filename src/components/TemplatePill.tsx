import type { TaskTemplate } from '../types';
import { byCategoryLabel } from '../utils/summary';

interface TemplatePillProps {
  template: TaskTemplate;
  onPick: (template: TaskTemplate) => void;
}

export function TemplatePill({ template, onPick }: TemplatePillProps) {
  return (
    <button className="template-pill" type="button" onClick={() => onPick(template)}>
      <span>{template.title}</span>
      <small>{byCategoryLabel(template.category)}</small>
    </button>
  );
}