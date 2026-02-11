document.addEventListener('DOMContentLoaded', () => {

    // ============================================================
    // 1. LÓGICA DAS MÁSCARAS
    // ============================================================

    // --- MÁSCARA DE TELEFONE ---
    const phoneInput = document.getElementById('telefone');
    if (phoneInput) {
        phoneInput.addEventListener('input', function (e) {
            let value = e.target.value.replace(/\D/g, "");
            if (value.length > 11) value = value.slice(0, 11);
            if (value.length > 2) value = `(${value.substring(0, 2)}) ${value.substring(2)}`;
            if (value.length > 9) value = `${value.substring(0, 10)}-${value.substring(10)}`;
            e.target.value = value;
            if (value.length >= 14) clearError(phoneInput);
        });
    }

    // --- MÁSCARA DE NOME ---
    const nameInput = document.getElementById('nome');
    if (nameInput) {
        nameInput.addEventListener('input', function (e) {
            this.value = this.value.replace(/[0-9]/g, '');
            if (validateName(this.value)) clearError(this);
        });
    }

    // ============================================================
    // 2. VALIDAÇÃO E ENVIO DO FORMULÁRIO
    // ============================================================
    const contactForm = document.getElementById('contactForm');

    if (contactForm) {

        function showError(input, message) {
            const group = input.closest('.input-group');
            const msgSpan = group.querySelector('.error-msg');
            group.classList.add('error');
            if (message && msgSpan) msgSpan.textContent = message;
        }

        function clearError(input) {
            const group = input.closest('.input-group');
            group.classList.remove('error');
        }

        // Regras
        function validateName(name) {
            const trimmed = name.trim();
            const words = trimmed.split(/\s+/);
            const hasNumbers = /\d/.test(name);
            return words.length >= 2 && !hasNumbers && trimmed.length > 3;
        }

        function validateEmail(email) {
            const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return re.test(String(email).toLowerCase());
        }

        // Evento de Envio
        contactForm.addEventListener('submit', function (e) {
            e.preventDefault();
            let isValid = true;
            let firstInvalidInput = null;

            const nome = document.getElementById('nome');
            const empresa = document.getElementById('empresa');
            const email = document.getElementById('email');
            const telefone = document.getElementById('telefone');
            const profissional = document.getElementById('profissional');
            const mensagem = document.getElementById('mensagem'); // ✅ Novo campo validado

            // 1. Nome
            if (!validateName(nome.value)) {
                showError(nome, "*Digite nome e sobrenome");
                isValid = false;
                if (!firstInvalidInput) firstInvalidInput = nome;
            } else { clearError(nome); }

            // 2. Empresa
            if (empresa.value.trim() === "") {
                showError(empresa, "*Campo obrigatório");
                isValid = false;
                if (!firstInvalidInput) firstInvalidInput = empresa;
            } else { clearError(empresa); }

            // 3. Email
            if (!validateEmail(email.value)) {
                showError(email, "*E-mail inválido");
                isValid = false;
                if (!firstInvalidInput) firstInvalidInput = email;
            } else { clearError(email); }

            // 4. Telefone
            if (telefone.value.length < 14) {
                showError(telefone, "*Telefone incompleto");
                isValid = false;
                if (!firstInvalidInput) firstInvalidInput = telefone;
            } else { clearError(telefone); }

            // 5. Profissional
            if (profissional.value === "") {
                showError(profissional, "*Selecione uma opção");
                isValid = false;
                if (!firstInvalidInput) firstInvalidInput = profissional;
            } else { clearError(profissional); }

            // 6. Mensagem (Mínimo 200 chars)
            if (mensagem.value.trim().length < 200) {
                // Aqui define o texto e mostra o erro
                showError(mensagem, "*Mínimo de 200 caracteres");
                isValid = false;
                if (!firstInvalidInput) firstInvalidInput = mensagem;
            } else {
                clearError(mensagem);
            }

            // --- Resultado ---
            if (!isValid) {
                if (firstInvalidInput) {
                    firstInvalidInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    firstInvalidInput.focus();
                }
            } else {
                // Sucesso
                const btn = this.querySelector('button');
                const originalText = btn.textContent;
                btn.textContent = "Enviando...";
                btn.style.opacity = "0.7";

                setTimeout(() => {
                    btn.textContent = "Recebido! Entraremos em contato 🚀";
                    btn.style.backgroundColor = "#27c93f";
                    btn.style.borderColor = "#27c93f";
                    btn.style.color = "white";

                    contactForm.reset();
                    // Reseta contador visualmente
                    const counter = document.getElementById('charCount');
                    if (counter) {
                        counter.textContent = "0 / 1000";
                        counter.style.color = "#ffbd2e"; // Volta pra amarelo/laranja
                    }

                    setTimeout(() => {
                        btn.textContent = originalText;
                        btn.style.backgroundColor = "";
                        btn.style.borderColor = "";
                        btn.style.color = "";
                        btn.style.opacity = "1";
                    }, 4000);
                }, 1500);
            }
        });

        // Eventos de Digitação (Limpar erros)
        [document.getElementById('email'), document.getElementById('profissional')].forEach(input => {
            if (!input) return;
            input.addEventListener('input', function () {
                let valid = false;
                if (this.id === 'email') valid = validateEmail(this.value);
                if (this.id === 'profissional') valid = this.value !== "";
                if (valid) clearError(this);
            });
        });

        // Empresa limpa imediato
        const empresaInput = document.getElementById('empresa');
        if (empresaInput) {
            empresaInput.addEventListener('input', function () {
                if (this.value.trim().length > 0) clearError(this);
            });
        }
    }

    // ============================================================
    // 3. FUNCIONALIDADES GERAIS
    // ============================================================

    // Accordion
    const accordions = document.querySelectorAll('.accordion-header');
    accordions.forEach(acc => {
        acc.addEventListener('click', () => {
            const item = acc.parentElement;
            const content = item.querySelector('.accordion-content');
            const icon = acc.querySelector('.icon');
            const isOpen = content.style.maxHeight;

            document.querySelectorAll('.accordion-item').forEach(i => {
                i.querySelector('.accordion-content').style.maxHeight = null;
                i.querySelector('.accordion-header .icon').textContent = '+';
                i.classList.remove('active');
            });

            if (!isOpen) {
                content.style.maxHeight = content.scrollHeight + "px";
                icon.textContent = '-';
                item.classList.add('active');
            }
        });
    });

    // Animação FadeIn
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1 });

    const cards = document.querySelectorAll('.bento-card');
    cards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'all 0.6s ease-out';
        observer.observe(card);
    });

    // --- LÓGICA DO CONTADOR E ERRO DA MENSAGEM (REVISADA) ---
    const msgInput = document.getElementById('mensagem');
    const charCountDisplay = document.getElementById('charCount');

    if (msgInput && charCountDisplay) {
        // Define o estado inicial corretamente ao carregar a página
        const maxLength = msgInput.getAttribute('maxlength') || 1000;
        charCountDisplay.textContent = `0 / ${maxLength}`;
        charCountDisplay.style.color = "#ffbd2e";

        msgInput.addEventListener('input', function () {
            const currentLength = this.value.length || 0; // Garante que seja 0 se estiver vazio
            const max = this.getAttribute('maxlength') || 1000; // Fallback para 1000
            const minLength = 200;

            // Atualiza o texto sem o risco de exibir 'null'
            charCountDisplay.textContent = `${currentLength} / ${max}`;

            // Lógica visual de cores
            if (currentLength < minLength) {
                charCountDisplay.style.color = "#ffbd2e"; // Amarelo
            } else if (currentLength >= (max * 0.9)) {
                charCountDisplay.style.color = "#ff5f56"; // Vermelho (perto do limite)
                clearError(this);
            } else {
                charCountDisplay.style.color = "#27c93f"; // Verde (Meta batida)
                clearError(this);
            }
        });
    }
});