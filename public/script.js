
    // =========================
    // Utilitários e Acessibilidade
    // =========================
    (function(){
      // Ano atual no rodapé
      document.getElementById('ano').textContent = new Date().getFullYear();

      // Voltar ao topo (âncora para #topo virtual)
      document.getElementById('backToTop').addEventListener('click', function(e){
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });

      // Interseção para animação fade-in
      const io = new IntersectionObserver((entries)=>{
        entries.forEach(entry=>{
          if(entry.isIntersecting){ entry.target.classList.add('show'); }
        });
      },{threshold: .12});
      document.querySelectorAll('.fade-in').forEach(el=> io.observe(el));
    })();

    // =========================
    // Modo Claro/Escuro
    // =========================
    (function(){
      const btn = document.getElementById('toggleTheme');
      const root = document.documentElement; // <html>

      // Preferência salva
      const saved = localStorage.getItem('theme');
      if(saved === 'light'){ root.classList.add('light'); btn.setAttribute('aria-pressed','true'); btn.textContent = '☀️'; }

      btn.addEventListener('click', ()=>{
        const isLight = root.classList.toggle('light');
        btn.setAttribute('aria-pressed', String(isLight));
        btn.textContent = isLight ? '☀️' : '🌙';
        localStorage.setItem('theme', isLight ? 'light' : 'dark');
      });
    })();

    // =========================
    // Botão: Abrir Chatbot (Aside deslizante)
    // =========================
    (function(){
      const pane = document.getElementById('chatPane');
      const openBtns = [document.getElementById('btnAbrirChatbot'), document.getElementById('btnAbrirChatbotHero')];
      const closeBtn = document.getElementById('closeChat');
      const firstFocusable = document.getElementById('chatText');

      function openChat(){
        pane.classList.add('open');
        pane.setAttribute('aria-hidden','false');
        setTimeout(()=> firstFocusable && firstFocusable.focus(), 150);
      }
      function closeChat(){
        pane.classList.remove('open');
        pane.setAttribute('aria-hidden','true');
      }

      openBtns.forEach(b=> b && b.addEventListener('click', openChat));
      closeBtn.addEventListener('click', closeChat);

      // Fechar com ESC
      window.addEventListener('keydown', (e)=>{
        if(e.key === 'Escape' && pane.classList.contains('open')) closeChat();
      });
    })();

    // =========================
    // Chatbot Demo (sem backend)
    // =========================
    (function(){
      const form = document.getElementById('chatForm');
      const input = document.getElementById('chatText');
      const history = document.getElementById('chatHistory');

      form.addEventListener('submit', (e)=>{
        e.preventDefault();
        const text = (input.value || '').trim();
        if(!text) return;
        // Adiciona mensagem do usuário
        const u = document.createElement('div');
        u.className = 'msg user';
        u.textContent = text;
        history.appendChild(u);

        // Resposta fictícia
        const b = document.createElement('div');
        b.className = 'msg bot';
        b.textContent = 'Mensagem recebida! Para saber mais, acesse as seções “Curiosidades” e “Fatos”.';
        history.appendChild(b);

        // rolar para o fim
        history.scrollTop = history.scrollHeight;
        input.value = '';
      });
    })();

    // =========================
    // Acessibilidade extra: focos programáticos nos links da nav ao usar teclado
    // =========================
    (function(){
      const links = document.querySelectorAll('.nav-links a');
      links.forEach(a=>{
        a.addEventListener('keydown', (e)=>{
          if(e.key === 'Enter' || e.key === ' '){
            e.preventDefault();
            a.click();
          }
        });
      });
    })();

// ----------------- Chatbot -----------------
function abrirChatbot() {
  const chatbot = document.getElementById("meu-chatbot");
  chatbot.style.display = chatbot.style.display === "none" ? "block" : "none";
}

// ----------------- Variáveis globais -----------------
let stream = null;
let modelosCarregados = false;

document.addEventListener("DOMContentLoaded", () => {
  const abrirIA = document.getElementById('abrirIA');
  const cameraModal = document.getElementById('cameraModal');
  const fecharModal = document.getElementById('fecharModal');
  const video = document.getElementById('video');
  const tirarFoto = document.getElementById('tirarFoto');
  const fotoCanvas = document.getElementById('fotoCanvas');
  const modalStatus = document.getElementById('modalStatus');
  let stream = null;
  let modelosCarregados = false;

  async function carregarModelos() {
    if (modelosCarregados) return;
    modalStatus.innerText = 'Carregando modelos...';
    try {
      await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
      await faceapi.nets.faceExpressionNet.loadFromUri('/models');
      modelosCarregados = true;
      modalStatus.innerText = 'Modelos carregados.';
    } catch (err) {
      console.error('Erro carregando modelos:', err);
      modalStatus.innerText = 'Erro ao carregar modelos. Veja console.';
    }
  }

  abrirIA.addEventListener('click', async () => {
    cameraModal.style.display = 'flex';
    cameraModal.setAttribute('aria-hidden', 'false');
    modalStatus.innerText = 'Carregando...';
    await carregarModelos();

    try {
      stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640 } });
      video.srcObject = stream;
      await video.play();
      modalStatus.innerText = 'Câmera ativa. Posicione seu rosto e clique em 📸';
    } catch (err) {
      console.error('Erro ao acessar a câmera:', err);
      modalStatus.innerText = 'Não foi possível acessar a câmera.';
    }
  });

  fecharModal.addEventListener('click', () => {
    pararCamera();
    cameraModal.style.display = 'none';
    cameraModal.setAttribute('aria-hidden', 'true');
    modalStatus.innerText = 'Aguardando...';
  });

  function pararCamera() {
    if (stream) {
      stream.getTracks().forEach(t => t.stop());
      stream = null;
    }
    video.srcObject = null;
  }

  tirarFoto.addEventListener('click', async () => {
    if (!video || video.readyState < 2) {
      modalStatus.innerText = 'Vídeo não pronto. Tente novamente.';
      return;
    }

    fotoCanvas.width = video.videoWidth || 640;
    fotoCanvas.height = video.videoHeight || 480;
    const ctx = fotoCanvas.getContext('2d');
    ctx.drawImage(video, 0, 0, fotoCanvas.width, fotoCanvas.height);

    modalStatus.innerText = 'Enviando foto para processamento...';
    pararCamera();
    cameraModal.style.display = 'none';
    cameraModal.setAttribute('aria-hidden', 'true');

    fotoCanvas.toBlob(async (blob) => {
      if (!blob) {
        modalStatus.innerText = 'Erro ao capturar a foto.';
        return;
      }

      const formData = new FormData();
      formData.append('foto', blob, 'foto.png');

      try {
        const response = await fetch(`${window.location.origin}/processar-foto`, {
          method: 'POST',
          body: formData,
        });

        const data = await response.json();

        if (data.facesEncontradas === 0) {
          modalStatus.innerText = 'Nenhuma face detectada na foto.';
          return;
        }

        const dataUrl = fotoCanvas.toDataURL('image/png');
        sessionStorage.setItem('ultimaFoto', dataUrl);

        const emocao = data.emocao || 'neutral';
        const confianca = data.confianca || 0;
        window.location.href = `resultado.html?emocao=${encodeURIComponent(emocao)}&conf=${encodeURIComponent(confianca)}`;

      } catch (err) {
        modalStatus.innerText = 'Erro ao enviar foto para o servidor.';
        console.error('Erro fetch:', err);
      }
    }, 'image/png');
  });
});
