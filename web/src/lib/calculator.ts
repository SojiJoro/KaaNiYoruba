// Káà — Calculator engine
// ---------------------------------------------------------------------------
// A small, dependency-free expression evaluator that supports +, −, ×, ÷
// with operator precedence. Designed to keep state as a single readable
// expression string so the UI can render both Arabic and Yoruba projections
// of the same expression without divergence.

export type CalcKey =
  | '0'
  | '1'
  | '2'
  | '3'
  | '4'
  | '5'
  | '6'
  | '7'
  | '8'
  | '9'
  | '.'
  | '+'
  | '−'
  | '×'
  | '÷'
  | '='
  | 'C'
  | '⌫';

export interface CalcState {
  expression: string; // e.g. "2+2", "12×3.5"
  lastResult: number | null;
  error: string | null;
}

export const initialState: CalcState = {
  expression: '',
  lastResult: null,
  error: null,
};

const OPERATORS = new Set(['+', '−', '×', '÷']);

function isOperator(c: string) {
  return OPERATORS.has(c);
}

export function applyKey(state: CalcState, key: CalcKey): CalcState {
  // Reset error state on any new key.
  const base: CalcState = { ...state, error: null };

  if (key === 'C') {
    return { ...initialState };
  }

  if (key === '⌫') {
    if (base.expression.length === 0) return base;
    return { ...base, expression: base.expression.slice(0, -1) };
  }

  if (key === '=') {
    const result = evaluate(base.expression);
    if (result.error) {
      return { ...base, error: result.error };
    }
    return {
      expression: formatNumber(result.value!),
      lastResult: result.value!,
      error: null,
    };
  }

  // Digits and decimal
  if (/^[0-9.]$/.test(key)) {
    // Prevent multiple decimals in the same operand.
    if (key === '.') {
      const lastOpIndex = lastOperatorIndex(base.expression);
      const currentOperand = base.expression.slice(lastOpIndex + 1);
      if (currentOperand.includes('.')) return base;
      if (currentOperand.length === 0) {
        return { ...base, expression: base.expression + '0.' };
      }
    }
    // Replace a stale result with a fresh number when typing after "=".
    if (base.lastResult !== null && base.expression === formatNumber(base.lastResult)) {
      return { ...base, expression: key, lastResult: null };
    }
    return { ...base, expression: base.expression + key };
  }

  // Operators
  if (isOperator(key)) {
    if (base.expression === '') {
      // Allow a leading "−" for negative numbers.
      if (key === '−') return { ...base, expression: '−' };
      return base;
    }
    const lastChar = base.expression[base.expression.length - 1];
    if (isOperator(lastChar)) {
      // Replace the trailing operator.
      return { ...base, expression: base.expression.slice(0, -1) + key };
    }
    return { ...base, expression: base.expression + key };
  }

  return base;
}

function lastOperatorIndex(expr: string): number {
  for (let i = expr.length - 1; i >= 0; i--) {
    if (isOperator(expr[i])) return i;
  }
  return -1;
}

interface EvalResult {
  value: number | null;
  error: string | null;
}

export function evaluate(expr: string): EvalResult {
  if (!expr) return { value: 0, error: null };
  // Strip trailing operator (typed but no operand yet).
  let cleaned = expr;
  while (cleaned.length && isOperator(cleaned[cleaned.length - 1])) {
    cleaned = cleaned.slice(0, -1);
  }
  if (!cleaned) return { value: 0, error: null };

  try {
    const tokens = tokenize(cleaned);
    const rpn = toRPN(tokens);
    const value = evalRPN(rpn);
    if (!Number.isFinite(value)) {
      return { value: null, error: 'Àṣìṣe' };
    }
    return { value, error: null };
  } catch (err) {
    return { value: null, error: (err as Error).message };
  }
}

type Token = { kind: 'num'; value: number } | { kind: 'op'; value: string };

function tokenize(expr: string): Token[] {
  const tokens: Token[] = [];
  let buf = '';
  for (let i = 0; i < expr.length; i++) {
    const c = expr[i];
    if (/[0-9.]/.test(c)) {
      buf += c;
      continue;
    }
    if (isOperator(c)) {
      // Handle unary minus at start or after another operator.
      if (c === '−' && (buf === '' && (tokens.length === 0 || tokens[tokens.length - 1].kind === 'op'))) {
        buf += '-';
        continue;
      }
      if (buf) {
        tokens.push({ kind: 'num', value: Number(buf) });
        buf = '';
      }
      tokens.push({ kind: 'op', value: c });
      continue;
    }
    throw new Error(`Àṣìṣe`);
  }
  if (buf) tokens.push({ kind: 'num', value: Number(buf) });
  return tokens;
}

const PRECEDENCE: Record<string, number> = {
  '+': 1,
  '−': 1,
  '×': 2,
  '÷': 2,
};

function toRPN(tokens: Token[]): Token[] {
  const out: Token[] = [];
  const ops: Token[] = [];
  for (const t of tokens) {
    if (t.kind === 'num') {
      out.push(t);
    } else {
      while (
        ops.length &&
        PRECEDENCE[ops[ops.length - 1].value] >= PRECEDENCE[t.value]
      ) {
        out.push(ops.pop()!);
      }
      ops.push(t);
    }
  }
  while (ops.length) out.push(ops.pop()!);
  return out;
}

function evalRPN(rpn: Token[]): number {
  const stack: number[] = [];
  for (const t of rpn) {
    if (t.kind === 'num') {
      stack.push(t.value);
      continue;
    }
    const b = stack.pop()!;
    const a = stack.pop()!;
    switch (t.value) {
      case '+':
        stack.push(a + b);
        break;
      case '−':
        stack.push(a - b);
        break;
      case '×':
        stack.push(a * b);
        break;
      case '÷':
        if (b === 0) throw new Error('Pípín pẹ̀lú òdo');
        stack.push(a / b);
        break;
    }
  }
  return stack[0] ?? 0;
}

export function formatNumber(n: number): string {
  if (!Number.isFinite(n)) return '—';
  if (Number.isInteger(n)) return n.toString();
  // Trim trailing zeros and cap to 6 decimal places.
  return parseFloat(n.toFixed(6)).toString();
}
