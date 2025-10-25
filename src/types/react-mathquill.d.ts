declare module 'react-mathquill' {
  import * as React from 'react';

  export interface MathQuillProps {
    latex?: string;
    onChange?: (latex: string) => void;
    config?: Record<string, unknown>;
    mathquillDidMount?: (mq: unknown) => void;
    className?: string;
  }

  export const addStyles: () => void;
  export const EditableMathField: React.FC<MathQuillProps & { latex?: string }>;

  const MathQuill: React.FC<MathQuillProps>;
  export default MathQuill;
}

