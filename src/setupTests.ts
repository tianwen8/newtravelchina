import '@testing-library/jest-dom';

// 添加 TextEncoder 和 TextDecoder 全局对象
if (typeof global.TextEncoder === 'undefined') {
  class TextEncoderPolyfill {
    encode(text: string) {
      const buffer = new Uint8Array(text.length);
      for (let i = 0; i < text.length; i++) {
        buffer[i] = text.charCodeAt(i);
      }
      return buffer;
    }
  }
  global.TextEncoder = TextEncoderPolyfill as any;
}

if (typeof global.TextDecoder === 'undefined') {
  class TextDecoderPolyfill {
    decode(buffer: Uint8Array) {
      return String.fromCharCode.apply(null, Array.from(buffer));
    }
  }
  global.TextDecoder = TextDecoderPolyfill as any;
}

// 扩展全局类型
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeInTheDocument(): R;
    }
  }
}