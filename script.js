document.addEventListener('DOMContentLoaded', () => {

    /* ============================================================
       1. HELPER FUNCTIONS (Globais)
    ============================================================ */
    const showError = (input, message) => {
        let inputGroup = input.parentElement;
        // Ajuste para encontrar o pai correto em campos complexos
        if (inputGroup.classList.contains('phone-wrapper-combo') || inputGroup.classList.contains('file-upload-wrapper')) {
            inputGroup = inputGroup.parentElement;
        }

        inputGroup.classList.add('error');
        const errorDisplay = inputGroup.querySelector('.error-msg');
        if (errorDisplay) {
            errorDisplay.innerText = message;
            errorDisplay.style.display = 'block';
        }
    };

    const clearError = (input) => {
        let inputGroup = input.parentElement;
        if (inputGroup.classList.contains('phone-wrapper-combo') || inputGroup.classList.contains('file-upload-wrapper')) {
            inputGroup = inputGroup.parentElement;
        }

        inputGroup.classList.remove('error');
        const errorDisplay = inputGroup.querySelector('.error-msg');
        if (errorDisplay) errorDisplay.style.display = 'none';
    };

    // VALIDADORES
    const validators = {
        email: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()),
        nome: (value) => value.trim().split(' ').length >= 2,
        // LinkedIn: Valida se tem linkedin.com e tamanho mínimo
        linkedin: (value) => value.toLowerCase().includes("linkedin.com") && value.trim().length > 15,
        mensagem: (value) => value.trim().length >= 20,
        notEmpty: (value) => value.trim() !== "",
        // PDF: Verifica se tem arquivo e se termina com .pdf
        pdf: (fileInput) => fileInput.files.length > 0 && fileInput.files[0].name.toLowerCase().endsWith('.pdf')
    };

    // Validação de Telefone com DDI
    const validatePhone = (value, ddi) => {
        const clean = value.replace(/\D/g, '');
        if (ddi === '+55') return clean.length >= 10; // Brasil
        if (ddi === '+351') return clean.length === 9; // Portugal
        return clean.length > 5; // Outros/Fallback
    };

    /* ============================================================
       2. MÁSCARA DINÂMICA (DDI)
    ============================================================ */
    const ddiSelect = document.getElementById('ddi'); // Pode não existir no form de trabalho
    const telInput = document.getElementById('telefone');

    if (telInput) {
        telInput.addEventListener('input', function (e) {
            // Se não tiver select de DDI (Trabalhe Conosco), assume +55
            const ddi = ddiSelect ? ddiSelect.value : '+55';
            let value = e.target.value.replace(/\D/g, '');

            if (ddi === '+55') {
                let x = value.match(/(\d{0,2})(\d{0,5})(\d{0,4})/);
                e.target.value = !x[2] ? x[1] : '(' + x[1] + ') ' + x[2] + (x[3] ? '-' + x[3] : '');
            } else if (ddi === '+351') {
                let x = value.match(/(\d{0,3})(\d{0,3})(\d{0,3})/);
                e.target.value = !x[2] ? x[1] : x[1] + ' ' + x[2] + (x[3] ? ' ' + x[3] : '');
            }
        });

        if (ddiSelect) {
            ddiSelect.addEventListener('change', function () {
                telInput.value = '';
                clearError(telInput);
                if (this.value === '+55') telInput.placeholder = "(00) 00000-0000";
                else telInput.placeholder = "000 000 000";
            });
        }
    }

    /* ============================================================
       3. VALIDAÇÃO REAL-TIME (Ao digitar)
    ============================================================ */
    const inputs = document.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
        const eventType = (input.tagName === 'SELECT' || input.type === 'file') ? 'change' : 'input';

        input.addEventListener(eventType, function () {
            let inputGroup = this.parentElement;
            // Ajuste de hierarquia para File e Combo Phone
            if (this.type === 'file' || this.parentElement.classList.contains('phone-wrapper-combo')) {
                inputGroup = inputGroup.parentElement;
            }

            // Só valida se já estiver com erro (UX: não incomodar antes da hora)
            if (inputGroup.classList.contains('error')) {
                let valid = false;
                switch (this.id) {
                    case 'nome': valid = validators.nome(this.value); break;
                    case 'email': valid = validators.email(this.value); break;
                    case 'empresa': valid = validators.notEmpty(this.value); break;
                    case 'mensagem': valid = validators.mensagem(this.value); break;
                    case 'linkedin': valid = validators.linkedin(this.value); break;
                    case 'perfil': valid = validators.notEmpty(this.value); break;
                    case 'cv': valid = validators.pdf(this); break;
                    case 'telefone':
                        const ddiNow = ddiSelect ? ddiSelect.value : '+55';
                        valid = validatePhone(this.value, ddiNow);
                        break;
                    default: valid = true;
                }
                if (valid) clearError(this);
            }
        });
    });

    /* ============================================================
           4. LÓGICA DE ENVIO (AJAX + SUCCESS FIXO)
        ============================================================ */
    const handleFormSubmit = (formId, inputsId, msgId, isContact = false) => {
        const form = document.getElementById(formId);
        if (!form) return;

        form.addEventListener('submit', function (e) {
            e.preventDefault(); // BLOQUEIO IMEDIATO DO REDIRECT

            // 1. Preencher a Data Oculta IMEDIATAMENTE
            const hiddenDate = form.querySelector('input[name="Data_Envio"]');
            if (hiddenDate) {
                const agora = new Date();
                hiddenDate.value = agora.toLocaleDateString('pt-BR') + ' às ' + agora.toLocaleTimeString('pt-BR');
            }

            let isValid = true;
            let firstInvalidInput = null;

            // --- VALIDAÇÕES ---
            const nome = form.querySelector('#nome');
            const email = form.querySelector('#email');
            const telefone = form.querySelector('#telefone');

            if (!validators.nome(nome.value)) { showError(nome, "*Digite nome e sobrenome"); isValid = false; if (!firstInvalidInput) firstInvalidInput = nome; }
            if (!validators.email(email.value)) { showError(email, "*E-mail inválido"); isValid = false; if (!firstInvalidInput) firstInvalidInput = email; }

            // Fix do Telefone: Verifica se o DDI existe na página, se não, usa +55
            const ddiEl = form.querySelector('.ddi-select') || document.getElementById('ddi');
            const ddiVal = ddiEl ? ddiEl.value : '+55';
            if (!validatePhone(telefone.value, ddiVal)) { showError(telefone, "*Telefone incompleto"); isValid = false; if (!firstInvalidInput) firstInvalidInput = telefone; }

            if (isContact) {
                const empresa = form.querySelector('#empresa');
                const mensagem = form.querySelector('#mensagem');
                if (!validators.notEmpty(empresa.value)) { showError(empresa, "*Campo obrigatório"); isValid = false; if (!firstInvalidInput) firstInvalidInput = empresa; }
                if (!validators.mensagem(mensagem.value)) { showError(mensagem, "*Mínimo de 20 caracteres"); isValid = false; if (!firstInvalidInput) firstInvalidInput = mensagem; }
            } else {
                const linkedin = form.querySelector('#linkedin');
                const perfil = form.querySelector('#perfil');
                const cv = form.querySelector('#cv');
                if (!validators.linkedin(linkedin.value)) { showError(linkedin, "*Link inválido (LinkedIn)"); isValid = false; if (!firstInvalidInput) firstInvalidInput = linkedin; }
                if (!validators.notEmpty(perfil.value)) { showError(perfil, "*Selecione sua stack"); isValid = false; if (!firstInvalidInput) firstInvalidInput = perfil; }
                if (!validators.pdf(cv)) { showError(cv, "*Anexe PDF"); isValid = false; if (!firstInvalidInput) firstInvalidInput = cv; }
            }

            if (!isValid) {
                if (firstInvalidInput) firstInvalidInput.focus();
                return;
            }

            // --- PROCESSO DE ENVIO ---
            const submitBtn = form.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.innerText;

            submitBtn.classList.add('btn-loading'); // Ativa o spinner que criamos no CSS
            submitBtn.disabled = true;

            const formData = new FormData(form);

            fetch(form.action, {
                method: "POST",
                body: formData,
                headers: { 'Accept': 'application/json' }
            })
                .then(response => response.ok ? response.json() : Promise.reject())
                .then(data => {
                    // SUCESSO!
                    const inputsDiv = document.getElementById(inputsId);
                    const msgDiv = document.getElementById(msgId);

                    if (inputsDiv && msgDiv) {
                        inputsDiv.style.display = 'none';
                        msgDiv.style.display = 'block';
                    }
                    submitBtn.classList.remove('btn-loading');
                })
                .catch(error => {
                    console.error("Erro:", error);
                    alert("Erro ao enviar. Verifique o tamanho do PDF (máx 5MB) ou sua conexão.");
                    submitBtn.classList.remove('btn-loading');
                    submitBtn.innerText = originalBtnText;
                    submitBtn.disabled = false;
                });
        });
    };

    /* ============================================================
       5. EXTRAS (File Name, Accordion, Modais, Scroll)
    ============================================================ */

    // Nome do Arquivo no Input File
    const fileInput = document.getElementById('cv');
    const fileNameDisplay = document.getElementById('fileName');
    if (fileInput && fileNameDisplay) {
        fileInput.addEventListener('change', function () {
            if (this.files && this.files.length > 0) {
                fileNameDisplay.textContent = this.files[0].name;
                fileNameDisplay.style.color = "#ffffff";
                // Limpa erro se for PDF
                if (validators.pdf(this)) clearError(this);
            } else {
                fileNameDisplay.textContent = "Clique para selecionar arquivo PDF...";
                fileNameDisplay.style.color = "#94a3b8";
            }
        });
    }

    // Contador de Caracteres (Mensagem)
    const msgInput = document.getElementById('mensagem');
    const charCountDisplay = document.getElementById('charCount');
    if (msgInput && charCountDisplay) {
        msgInput.addEventListener('input', function () {
            const len = this.value.length;
            charCountDisplay.textContent = `${len} / 1000`;
            if (len >= 20) {
                charCountDisplay.style.color = "#27c93f";
                clearError(this);
            } else {
                charCountDisplay.style.color = "#ffbd2e";
            }
        });
    }

    // Acordeão
    document.querySelectorAll(".accordion-header").forEach(header => {
        header.addEventListener("click", function () {
            this.classList.toggle("active");
            const panel = this.nextElementSibling;
            if (panel.style.maxHeight) panel.style.maxHeight = null;
            else panel.style.maxHeight = panel.scrollHeight + "px";
        });
    });

    // Modais (Lógica Unificada)
    const openModal = (modal) => {
        if (modal) {
            modal.style.display = 'flex';
            setTimeout(() => modal.classList.add('active'), 10);
            document.body.style.overflow = 'hidden';
        }
    };
    const closeModal = (modal) => {
        if (modal) {
            modal.classList.remove('active');
            setTimeout(() => modal.style.display = 'none', 300);
            document.body.style.overflow = 'auto';
        }
    };

    // Botões que abrem modais
    const bindModal = (btnId, modalId) => {
        const btn = document.getElementById(btnId);
        const modal = document.getElementById(modalId);
        if (btn && modal) {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                openModal(modal);
            });
        }
    };

    bindModal('btnTermos', 'modalTermos');
    bindModal('btnPrivacidade', 'modalPrivacidade');
    bindModal('btnSobreNav', 'modalSobre');
    bindModal('btnSobreFooter', 'modalSobre');

    // Fechar Modais
    document.querySelectorAll('.modal-close').forEach(btn => {
        btn.addEventListener('click', () => closeModal(document.getElementById(btn.dataset.close)));
    });
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal-overlay')) closeModal(e.target);
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === "Escape") {
            const activeModal = document.querySelector('.modal-overlay.active');
            if (activeModal) closeModal(activeModal);
        }
    });

    // Voltar ao Topo
    const backToTopBtn = document.getElementById('backToTop');
    if (backToTopBtn) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) backToTopBtn.classList.add('show');
            else backToTopBtn.classList.remove('show');
        });
        backToTopBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    }

    // Scroll Fix (F5)
    if (history.scrollRestoration) history.scrollRestoration = 'manual';
    else window.onbeforeunload = function () { window.scrollTo(0, 0); }

});