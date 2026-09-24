// Denizen AI Website Interactive Script

// Theme Toggle
const themeToggleBtn = document.getElementById('theme-toggle');
const htmlEl = document.documentElement;

themeToggleBtn.addEventListener('click', () => {
  if (htmlEl.classList.contains('dark')) {
    htmlEl.classList.remove('dark');
    htmlEl.classList.add('light');
    themeToggleBtn.innerHTML = '<i class="fa-solid fa-sun"></i>';
  } else {
    htmlEl.classList.remove('light');
    htmlEl.classList.add('dark');
    themeToggleBtn.innerHTML = '<i class="fa-solid fa-moon"></i>';
  }
});

// Copy Command Function
function copyInstallCmd() {
  const cmdText = document.getElementById('pub-command').innerText;
  navigator.clipboard.writeText(cmdText).then(() => {
    const copyText = document.getElementById('copy-text');
    const copyIcon = document.getElementById('copy-icon');
    
    copyText.innerText = 'Copied!';
    copyIcon.className = 'fa-solid fa-check text-mint';
    
    setTimeout(() => {
      copyText.innerText = 'Copy';
      copyIcon.className = 'fa-regular fa-copy';
    }, 2000);
  });
}

// Quant Studio Interactive Simulator
const quantData = {
  'Q4_K_M': { orig: '6.8 GB', quant: '1.9 GB', ram: '2.4 GB', ratio: '3.5x' },
  'Q5_K_M': { orig: '6.8 GB', quant: '2.4 GB', ram: '3.0 GB', ratio: '2.8x' },
  'Q8_0':   { orig: '6.8 GB', quant: '3.7 GB', ram: '4.2 GB', ratio: '1.8x' },
  'Q2_K':   { orig: '6.8 GB', quant: '1.1 GB', ram: '1.6 GB', ratio: '6.1x' }
};

function updateQuantSim() {
  const select = document.getElementById('quant-method');
  const selected = select.value;
  const data = quantData[selected];

  document.getElementById('stat-orig').innerText = data.orig;
  document.getElementById('stat-quant').innerText = data.quant;
  document.getElementById('stat-ram').innerText = data.ram;
}

function simulateQuantization() {
  const btn = document.getElementById('run-quant-btn');
  const consoleLogs = document.getElementById('console-logs');
  const progressFill = document.getElementById('quant-progress');
  const selected = document.getElementById('quant-method').value;

  btn.disabled = true;
  btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Quantizing Model...';
  progressFill.style.width = '0%';

  const logs = [
    `[INFO] Target selected: ${selected} (GGUF Format)`,
    `[INFO] Analyzing model layers: 32 Attention Blocks, 4096 Hidden Dim`,
    `[INFO] Preserving local Swahili/English vocabulary & clinical tokenizer...`,
    `[RUNNING] Applying ${selected} quantization matrix...`,
    `[STATUS] Extracting weights & compiling GBNF grammar constraints...`,
    `[SUCCESS] GGUF Model successfully compiled! Output size: ${quantData[selected].quant}`,
    `[READY] Package ready for Flutter deployment with zero cloud dependencies!`
  ];

  let currentStep = 0;
  consoleLogs.innerHTML = `<span class="log-info">[START] Beginning Quant Studio build...</span>\n`;

  const interval = setInterval(() => {
    if (currentStep < logs.length) {
      const stepText = logs[currentStep];
      let cssClass = 'log-info';
      if (stepText.includes('SUCCESS')) cssClass = 'log-success';
      if (stepText.includes('RUNNING') || stepText.includes('STATUS')) cssClass = 'log-warn';

      consoleLogs.innerHTML += `<span class="${cssClass}">${stepText}</span>\n`;
      consoleLogs.scrollTop = consoleLogs.scrollHeight;
      
      currentStep++;
      progressFill.style.width = `${Math.min(100, (currentStep / logs.length) * 100)}%`;
    } else {
      clearInterval(interval);
      btn.disabled = false;
      btn.innerHTML = '<i class="fa-solid fa-check"></i> Quantization Complete!';
      
      setTimeout(() => {
        btn.innerHTML = '<i class="fa-solid fa-play"></i> Run One-Click Quantization';
      }, 3000);
    }
  }, 600);
}

// Code Demo Tab Switcher
const codeSnippets = {
  init: `import 'package:flutter/material.dart';
import 'package:denizen_ai/denizen_ai.dart';
import 'package:path_provider/path_provider.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // High-level DenizenAI Singleton instance
  final denizen = DenizenAI();

  final docsDir = await getApplicationDocumentsDirectory();
  final modelPath = '\${docsDir.path}/models/qwen2.5-0.5b-instruct-q4_k_m.gguf';

  // Load GGUF model into native llama.cpp memory
  await denizen.models.loadFromFile(modelPath);

  // Start stateful session & stream tokens locally
  final session = denizen.createSession(systemPrompt: 'You are a helpful assistant.');
  final tokenStream = session.streamChat('What are the primary symptoms of malaria?');

  tokenStream.listen((token) {
    print(token); // Streamed tokens in real-time
  });
}`,

  rag: `import 'package:denizen_ai/denizen_ai.dart';

// Initialize Offline RAG Service with local vector storage & TFLite
final embeddingProvider = TFLiteEmbeddingProvider();
final storageService = VectorStorageService();
await storageService.initialize();

final ingestionService = DocumentIngestionService(embeddingProvider, storageService);

// Ingest domain guidelines PDF offline
await ingestionService.ingestDocument(
  file: File('/path/to/clinical_guidelines.pdf'),
  documentId: 'doc_med_01',
);

// Create RAG-Enabled Session (automatically queries sqlite-vec)
final ragSession = denizen.createRagSession(
  embeddingProvider: embeddingProvider,
  storageService: storageService,
);

final reply = await ragSession.chat('What is the emergency triage protocol?');
print(reply);`,

  triage: `import 'package:denizen_ai/denizen_ai.dart';

// Custom on-device tool definition
class EmergencyTriageTool extends DenizenTool {
  EmergencyTriageTool()
      : super(
          name: 'log_emergency_triage',
          description: 'Logs patient triage assessment',
          parametersSchema: {
            'type': 'object',
            'properties': {
              'urgency_level': {
                'type': 'string',
                'enum': ['NORMAL', 'URGENT', 'CRITICAL_REFERRAL']
              },
            },
            'required': ['urgency_level']
          },
        );

  @override
  Future<Map<String, dynamic>> execute(Map<String, dynamic> arguments) async {
    return {'status': 'recorded', 'priority': arguments['urgency_level']};
  }
}

final registry = DenizenToolRegistry();
registry.registerTool(EmergencyTriageTool());

final toolSession = DenizenToolSession(denizen.engine, registry);

// Guarantees 100% valid structured JSON output via GBNF context grammar
final result = await toolSession.chat('Evaluate patient with high fever & neck stiffness.');
print(result);`,

  voice: `import 'package:denizen_ai/denizen_ai.dart';

final denizen = DenizenAI();

// Initialize Hands-Free Voice Consultation Session
final voiceSession = DenizenVoiceSession();

// Start hands-free Whisper STT + TTS voice loop
await voiceSession.startListening(
  onSpeechRecognized: (userVoiceText) {
    print('User Spoke: \$userVoiceText');
  },
  onResponseGenerated: (aiReplyText) {
    print('AI Replied: \$aiReplyText');
  },
);`
};

function switchTab(tabKey) {
  const tabs = document.querySelectorAll('.tab-btn');
  tabs.forEach(t => t.classList.remove('active'));
  
  event.target.classList.add('active');
  document.getElementById('code-display').innerText = codeSnippets[tabKey];
}

// Registration Form Simulation
function handleRegistration(e) {
  e.preventDefault();
  const msg = document.getElementById('reg-msg');
  msg.className = 'reg-message text-mint';
  msg.innerText = '🎉 You are on the priority list for the next Buildathon!';
  e.target.reset();
}

// ==========================================================================
// CodeLab Interactive Sandbox Simulation
// ==========================================================================
const codeLabDemos = {
  mpesa: {
    title: '💸 M-Pesa Fee Calculator',
    sub: 'Compute transaction fees offline on DLP tablets.',
    btnText: 'Compute Fee',
    prompt: 'Change button background to glowing emerald green',
    diff: {
      rem: '- background: #4F46E5;',
      add: '+ background: #10B981; box-shadow: 0 4px 14px rgba(16,185,129,0.4);'
    },
    actionStyle: { background: '#10B981', boxShadow: '0 4px 14px rgba(16,185,129,0.4)' }
  },
  flag: {
    title: '🇰🇪 Kenya Flag (HTML5 Canvas)',
    sub: 'Rendered with 2D Canvas coordinate geometry.',
    btnText: 'Draw Maasai Shield',
    prompt: 'Add Maasai warrior shield white border outline',
    diff: {
      rem: '- ctx.lineWidth = 1;',
      add: '+ ctx.lineWidth = 4; ctx.strokeStyle = "#FFFFFF"; ctx.stroke();'
    },
    actionStyle: { background: '#BB0000', boxShadow: '0 0 12px rgba(255,255,255,0.6)' }
  },
  quiz: {
    title: '🦁 Kenyan Wildlife Quiz',
    sub: 'Interactive quiz tracking student score offline.',
    btnText: 'Select Cheetah (Fastest)',
    prompt: 'Highlight correct option in neon cyan on tap',
    diff: {
      rem: '- button.style.color = "#E2E8F0";',
      add: '+ button.style.color = "#38BDF8"; button.style.borderColor = "#38BDF8";'
    },
    actionStyle: { background: '#0284C7', boxShadow: '0 0 15px rgba(56,189,248,0.5)' }
  }
};

let currentCodeLabKey = 'mpesa';

function selectCodeLabDemo(key) {
  currentCodeLabKey = key;
  const demo = codeLabDemos[key];

  document.querySelectorAll('.codelab-template-chip').forEach(c => c.classList.remove('active'));
  const chip = document.getElementById(`chip-${key}`);
  if (chip) chip.classList.add('active');

  document.getElementById('demo-title').innerText = demo.title;
  document.getElementById('demo-sub').innerText = demo.sub;
  document.getElementById('demo-btn').innerText = demo.btnText;
  document.getElementById('demo-btn').style.background = '#4F46E5';
  document.getElementById('demo-btn').style.boxShadow = 'none';
  document.getElementById('codelab-user-prompt').value = demo.prompt;
  document.getElementById('demo-output').innerText = '';
  document.getElementById('codelab-diff-view').style.display = 'none';

  // Reset pipeline steps
  document.getElementById('pipe-step-1').className = 'pipeline-step';
  document.getElementById('pipe-step-2').className = 'pipeline-step';
  document.getElementById('pipe-step-3').className = 'pipeline-step';
}

function runAgenticEditSimulation() {
  const demo = codeLabDemos[currentCodeLabKey];
  const btn = document.getElementById('run-codelab-btn');
  const step1 = document.getElementById('pipe-step-1');
  const step2 = document.getElementById('pipe-step-2');
  const step3 = document.getElementById('pipe-step-3');
  const diffBox = document.getElementById('codelab-diff-view');
  const demoBtn = document.getElementById('demo-btn');
  const demoOutput = document.getElementById('demo-output');

  btn.disabled = true;
  btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Running On-Device Agent...';
  diffBox.style.display = 'none';

  // Step 1: GBNF Plan
  step1.className = 'pipeline-step active';
  step2.className = 'pipeline-step';
  step3.className = 'pipeline-step';

  setTimeout(() => {
    // Step 2: Act / Delta
    step1.className = 'pipeline-step done';
    step2.className = 'pipeline-step active';

    diffBox.innerHTML = `<strong>Applied Diff (⚡ 1.2s):</strong><br><span style="color: #f87171;">${demo.diff.rem}</span><br><span style="color: #34d399;">${demo.diff.add}</span>`;
    diffBox.style.display = 'block';

    setTimeout(() => {
      // Step 3: Observe / Verify
      step2.className = 'pipeline-step done';
      step3.className = 'pipeline-step active';

      // Apply style to live mockup
      demoBtn.style.background = demo.actionStyle.background;
      demoBtn.style.boxShadow = demo.actionStyle.boxShadow;
      demoOutput.innerText = '✅ Hot-reloaded & running on localhost:8080 (0 errors)';

      setTimeout(() => {
        step3.className = 'pipeline-step done';
        btn.disabled = false;
        btn.innerHTML = '<i class="fa-solid fa-check"></i> Edit Applied in 1.2s!';

        setTimeout(() => {
          btn.innerHTML = '<i class="fa-solid fa-bolt"></i> Test On-Device Agentic Edit (⚡ 1.2s)';
        }, 3000);
      }, 400);
    }, 450);
  }, 400);
}


// ============================================================
// VISION STUDIO INTERACTIVE SIMULATOR
// ============================================================

const visionDemos = {
  medical: {
    title: 'Clinical Photo Analysis — Offline',
    featureIcon: 'fa-stethoscope',
    featureColor: 'var(--sketch-pink)',
    featureTitle: 'Clinical Photo Analysis',
    featureDesc: 'Analyze wound photos, rashes, and clinical presentations with grounded LLaVA reasoning.',
    imageLabel: 'Uploaded: wound_field_photo_nairobi_clinic.jpg',
    stream: [
      '[LLaVA-1.5] Loading image... 1024x768px downsample to 336x336 (auto-optimization)',
      '[ENGINE] Tokenizing image patches with CLIP vision encoder...',
      'Analyzing visual features...',
      'The image shows a healing laceration on the lower forearm, approximately 4cm in length.',
      'Wound edges appear approximated and dry with visible suture material.',
      'No signs of erythema, purulent discharge, or significant edema in surrounding tissue.',
      'Assessment: Wound healing is within normal progression for day 5 post-closure.',
      'Recommendation: Continue standard wound care. Review in 48h.',
      'Analysis complete. 0 cloud calls. 100% offline. 4.2s on-device.',
    ]
  },
  agri: {
    title: 'Crop Health Assessment — Offline',
    featureIcon: 'fa-seedling',
    featureColor: '#4ade80',
    featureTitle: 'Crop Disease Detection',
    featureDesc: 'Identify leaf blight, fungal infection, and nutrient deficiency from farm photos.',
    imageLabel: 'Uploaded: maize_field_photo_kisumu.jpg',
    stream: [
      '[LLaVA-1.5] Loading image... 2048x1536px downsample to 336x336 (auto-optimization)',
      '[ENGINE] Analyzing agricultural visual features...',
      'Maize plants show yellowing of lower leaves with brown necrotic patches.',
      'Pattern is consistent with Northern Leaf Blight (Exserohilum turcicum) - fungal infection.',
      'Approximately 30-40% of visible leaf area affected.',
      'Recommended Action: Apply fungicide (mancozeb or azoxystrobin).',
      'Improve field drainage and increase plant spacing for next planting cycle.',
      'Analysis complete. 0 cloud calls. 100% offline. 3.8s on-device.',
    ]
  },
  edu: {
    title: 'Student Work Analysis — Offline',
    featureIcon: 'fa-graduation-cap',
    featureColor: 'var(--sketch-cyan)',
    featureTitle: 'Educational Content Analysis',
    featureDesc: 'Grade handwritten work, explain diagrams, and provide step-by-step feedback.',
    imageLabel: 'Uploaded: student_math_homework_grade8.jpg',
    stream: [
      '[LLaVA-1.5] Loading image... 1280x960px downsample to 336x336',
      '[ENGINE] Analyzing handwritten mathematical work...',
      'Student is solving a quadratic equation: 2x^2 - 5x + 3 = 0',
      'Factoring approach: (2x - 3)(x - 1) = 0 -- approach is correct.',
      'Solution step 3 shows an arithmetic error: x = 3/2 written incorrectly as x = 2/3.',
      'Feedback: Great factoring technique! Check the fraction in step 3.',
      'Correct answers: x = 3/2 and x = 1.',
      'Analysis complete. 0 cloud calls. 100% offline. 3.1s on-device.',
    ]
  },
  infra: {
    title: 'Infrastructure Inspection — Offline',
    featureIcon: 'fa-wrench',
    featureColor: 'var(--sketch-yellow)',
    featureTitle: 'Infrastructure Defect Detection',
    featureDesc: 'Detect cracks, corrosion, and structural issues in roads, bridges, and buildings.',
    imageLabel: 'Uploaded: bridge_pillar_inspection_mombasa.jpg',
    stream: [
      '[LLaVA-1.5] Loading image... 3024x4032px downsample to 336x336 (auto-optimization)',
      '[ENGINE] Analyzing structural visual features...',
      'Concrete pillar shows horizontal cracking patterns at mid-section.',
      'Crack width estimated at 2-4mm -- exceeds maintenance threshold.',
      'Evidence of mild spalling and surface carbonation visible on lower section.',
      'Risk Level: MEDIUM -- schedule engineer inspection within 30 days.',
      'Recommend applying crack sealant to prevent water ingress and corrosion.',
      'Analysis complete. 0 cloud calls. 100% offline. 5.1s on-device.',
    ]
  }
};

let activeVisionDemo = 'medical';

function selectVisionDemo(demo) {
  activeVisionDemo = demo;
  document.querySelectorAll('.vision-chip').forEach(function(c) { c.classList.remove('active'); });
  document.getElementById('vc-' + demo).classList.add('active');

  const d = visionDemos[demo];
  document.getElementById('vision-console-title').textContent = d.title;
  const featRow = document.getElementById('vf-desc');
  featRow.querySelector('i').className = 'fa-solid ' + d.featureIcon;
  featRow.querySelector('i').style.color = d.featureColor;
  featRow.querySelector('strong').textContent = d.featureTitle;
  featRow.querySelector('p').textContent = d.featureDesc;
  document.getElementById('vision-stream-output').innerHTML = 'Click <strong>Analyze Image On-Device</strong> to see simulated inference...';
  document.getElementById('vision-placeholder').querySelector('p').textContent = d.imageLabel;
  document.getElementById('vision-loading-bar').style.display = 'none';
  var btn = document.getElementById('run-vision-btn');
  btn.disabled = false;
  btn.innerHTML = '<i class="fa-solid fa-eye"></i> Analyze Image On-Device';
}

function runVisionSimulation() {
  var btn = document.getElementById('run-vision-btn');
  var output = document.getElementById('vision-stream-output');
  var loadingBar = document.getElementById('vision-loading-bar');
  var demo = visionDemos[activeVisionDemo];

  btn.disabled = true;
  btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Analyzing On-Device...';
  output.innerHTML = '';
  loadingBar.style.display = 'block';

  var lineIndex = 0;
  var charIndex = 0;
  var currentLine = '';
  var fullText = '';

  function typeNextChar() {
    if (lineIndex >= demo.stream.length) {
      loadingBar.style.display = 'none';
      btn.disabled = false;
      btn.innerHTML = '<i class="fa-solid fa-check"></i> Analysis Complete!';
      setTimeout(function() {
        btn.innerHTML = '<i class="fa-solid fa-eye"></i> Analyze Image On-Device';
        btn.disabled = false;
      }, 4000);
      return;
    }

    var line = demo.stream[lineIndex];
    if (charIndex < line.length) {
      currentLine += line[charIndex];
      charIndex++;
      output.textContent = fullText + currentLine;
      setTimeout(typeNextChar, 18);
    } else {
      fullText += currentLine + '\n';
      currentLine = '';
      charIndex = 0;
      lineIndex++;
      output.textContent = fullText;
      setTimeout(typeNextChar, 150);
    }
  }

  setTimeout(typeNextChar, 600);
}
