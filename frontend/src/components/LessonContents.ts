// src/data/LessonContents.ts
// Defines the static reading content for each lesson, including original content for Lesson 0.

export interface LessonContent {
    title: string;
    // Array of paragraph HTML or text content
    paragraphs: string[];
    // Map of interactive terms to their detailed explanations
    interactiveTerms?: Record<string, string>;
  }
  
  export const lessonContents: Record<number, LessonContent> = {
    0: {
      title: 'Welcome to Quantum Computing',
      paragraphs: [
        'Quantum computing is a revolutionary technology that harnesses the principles of quantum mechanics to perform computations far beyond the capability of classical computers. These principles enable new ways of processing information that are fundamentally different from binary logic.',
        'Highlight any text to get options, or click underlined terms like qubit, superposition, and entanglement to learn more!',
        'Core Principles',
        'Qubits: Unlike classical bits, which are strictly 0 or 1, qubits can exist in a combination of both states simultaneously. This property, called superposition, provides quantum computers with unparalleled computational power for specific tasks.',
        'Superposition: Superposition enables a single qubit to represent multiple possibilities at once. For example, while a classical bit can only encode one number (0 or 1), a qubit in superposition can encode a combination of both. This property allows quantum computers to process many potential solutions simultaneously, exponentially increasing computational efficiency for some problems.',
        'Entanglement: Entanglement links two or more qubits such that the state of one immediately affects the state of the other, regardless of distance. This phenomenon forms the backbone of quantum communication and allows quantum computers to perform coordinated calculations across multiple qubits.',
        'Measurement: Measurement is the process of observing a qubit, which collapses its superposition into a definite state. This final state provides the result of a quantum computation, though the probabilistic nature of quantum mechanics means results may vary.',
        'Applications',
        'Cryptography: Quantum computers can break classical encryption methods, such as RSA, by efficiently factoring large numbers using algorithms like Shor\'s Algorithm. At the same time, they enable the creation of quantum-safe encryption methods, ensuring secure communication in the quantum era.',
        'Drug Discovery and Materials Science: By simulating molecular interactions at the quantum level, quantum computers can accelerate the discovery of new drugs and materials—critical for breakthroughs in medicine and materials science.',
        'Optimization: Many industries face optimization challenges—from supply chain logistics to portfolio management in finance. Quantum computers can evaluate multiple solutions simultaneously, offering potential speedups for finding optimal solutions.',
      ],
      interactiveTerms: {
        qubit: 'A quantum bit (qubit) is the basic unit of quantum information. Unlike a classical bit, which must be 0 or 1, a qubit can be 0, 1, or any superposition of these states until measured.',
        superposition: 'Superposition is a fundamental principle of quantum mechanics where a quantum system (like a qubit) can exist in multiple states at the same time. Only when measured does it collapse to a single definite outcome.',
        entanglement: 'Entanglement is a quantum phenomenon where two or more qubits become linked such that measuring one instantly influences the state of the other, no matter the distance separating them.',
        measurement: 'Measurement in quantum mechanics is the act of observing a quantum system. This observation forces the system to choose a definite classical state, collapsing any superposition.',
      }
    },
    // Additional lessons can be added here by their courseId...
  };
  