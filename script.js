document.addEventListener('DOMContentLoaded', () => {

    /* ============================================================
       1. HELPER FUNCTIONS & VALIDATORS
    ============================================================ */
    const showError = (input, message) => {
        let inputGroup = input.parentElement;
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

    const validators = {
        email: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()),
        nome: (value) => value.trim().split(' ').length >= 2,
        linkedin: (value) => value.toLowerCase().includes("linkedin.com") && value.trim().length > 15,
        mensagem: (value) => value.trim().length >= 20,
        notEmpty: (value) => value.trim() !== "",
        pdf: (fileInput) => fileInput.files.length > 0 && fileInput.files[0].name.toLowerCase().endsWith('.pdf')
    };

    const validatePhone = (value, ddi) => {
        const clean = value.replace(/\D/g, '');
        if (ddi === '+55') return clean.length >= 10;
        if (ddi === '+351') return clean.length === 9;
        return clean.length > 5;
    };

    /* ============================================================
       2. MÁSCARA DINÂMICA
    ============================================================ */
    const ddiSelect = document.getElementById('ddi');
    const telInput = document.getElementById('telefone');

    if (telInput) {
        telInput.addEventListener('input', function (e) {
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
       3. VALIDAÇÃO REAL-TIME
    ============================================================ */
    const inputs = document.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
        const eventType = (input.tagName === 'SELECT' || input.type === 'file') ? 'change' : 'input';

        input.addEventListener(eventType, function () {
            let inputGroup = this.parentElement;
            if (this.type === 'file' || this.id === 'telefone') {
                if (inputGroup.classList.contains('file-upload-wrapper') || inputGroup.classList.contains('phone-wrapper-combo')) {
                    inputGroup = inputGroup.parentElement;
                }
            }

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
                    default: valid = true;
                }
                if (valid) clearError(this);
            }
        });
    });

    /* ============================================================
           4. ENVIO DE FORMULÁRIOS (AJAX COM ARQUIVO FIX)
        ============================================================ */

    const handleFormSubmit = (formId, inputsId, msgId, isContact = false) => {
        const form = document.getElementById(formId);
        if (!form) return;

        form.addEventListener('submit', function (e) {
            e.preventDefault();

            let isValid = true;
            let firstInvalidInput = null;

            // --- VALIDAÇÕES (Mantive igual, só resumindo aqui) ---
            const nome = form.querySelector('#nome');
            const email = form.querySelector('#email');
            const telefone = form.querySelector('#telefone');

            // Validações Básicas
            if (!validators.nome(nome.value)) { showError(nome, "*Digite nome e sobrenome"); isValid = false; if (!firstInvalidInput) firstInvalidInput = nome; }
            if (!validators.email(email.value)) { showError(email, "*E-mail inválido"); isValid = false; if (!firstInvalidInput) firstInvalidInput = email; }

            // Validação Telefone e DDI
            const ddiElement = form.querySelector('.ddi-select') || document.getElementById('ddi'); // Busca genérica
            const ddi = ddiElement ? ddiElement.value : '+55';
            if (!validatePhone(telefone.value, ddi)) { showError(telefone, "*Telefone incompleto"); isValid = false; if (!firstInvalidInput) firstInvalidInput = telefone; }

            // Validações Específicas
            if (isContact) {
                const empresa = form.querySelector('#empresa');
                const mensagem = form.querySelector('#mensagem');
                if (!validators.notEmpty(empresa.value)) { showError(empresa, "*Campo obrigatório"); isValid = false; if (!firstInvalidInput) firstInvalidInput = empresa; }
                if (!validators.mensagem(mensagem.value)) { showError(mensagem, "*Mínimo de 20 caracteres"); isValid = false; if (!firstInvalidInput) firstInvalidInput = mensagem; }
            } else {
                const linkedin = form.querySelector('#linkedin');
                const perfil = form.querySelector('#perfil');
                const cv = form.querySelector('#cv');
                if (!validators.linkedin(linkedin.value)) { showError(linkedin, "*Link inválido (deve conter linkedin.com)"); isValid = false; if (!firstInvalidInput) firstInvalidInput = linkedin; }
                if (!validators.notEmpty(perfil.value)) { showError(perfil, "*Selecione sua stack"); isValid = false; if (!firstInvalidInput) firstInvalidInput = perfil; }
                if (!validators.pdf(cv)) { showError(cv, "*Anexe PDF"); isValid = false; if (!firstInvalidInput) firstInvalidInput = cv; }
            }

            if (!isValid) {
                if (firstInvalidInput) firstInvalidInput.focus();
                return;
            }

            // --- PREPARAÇÃO PARA ENVIO ---

            // 1. Preencher Data/Hora Oculta (Formato PT-BR)
            const hiddenDate = form.querySelector('input[name="Data_Envio"]');
            if (hiddenDate) {
                const agora = new Date();
                hiddenDate.value = agora.toLocaleString('pt-BR');
            }

            // 2. Loading State
            const submitBtn = form.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.innerText;
            submitBtn.classList.add('btn-loading'); // Ativa animação CSS
            submitBtn.disabled = true;

            // 3. Montar FormData (CRUCIAL PARA O ARQUIVO IR)
            const formData = new FormData(form);

            // 4. Envio Fetch (Sem headers manuais para não quebrar o upload)
            fetch("https://formsubmit.co/ajax/cazuza.paiva@gmail.com", {
                method: "POST",
                body: formData
            })
                .then(response => response.json())
                .then(data => {
                    // SUCESSO!
                    const inputsDiv = document.getElementById(inputsId);
                    const msgDiv = document.getElementById(msgId);

                    inputsDiv.style.display = 'none';
                    msgDiv.style.display = 'block';

                    // Se for Contato, reseta depois de 5s. Se for Trabalho, FICA PARA SEMPRE.
                    if (isContact) {
                        setTimeout(() => {
                            msgDiv.style.display = 'none';
                            inputsDiv.style.display = 'block';
                            form.reset();
                            const charCount = document.getElementById('charCount');
                            if (charCount) charCount.textContent = "0 / 1000";

                            submitBtn.classList.remove('btn-loading');
                            submitBtn.innerText = originalBtnText;
                            submitBtn.disabled = false;
                        }, 5000); // 5 segundos
                    } else {
                        // TRABALHE CONOSCO: Não faz nada, deixa a mensagem lá.
                        // O usuário precisa dar F5 ou clicar no botão "Enviar Outro" que pus no HTML
                    }
                })
                .catch(error => {
                    console.error("Erro no envio:", error);
                    alert("Ocorreu um erro ao enviar o currículo. Tente novamente.");
                    submitBtn.classList.remove('btn-loading');
                    submitBtn.innerText = originalBtnText;
                    submitBtn.disabled = false;
                });
        });
    };

    // Inicializa
    handleFormSubmit('contactForm', 'contactFormInputs', 'contactSuccessMsg', true);
    handleFormSubmit('workForm', 'workFormInputs', 'workSuccessMsg', false);

    /* ============================================================
       5. EXTRAS
    ============================================================ */
    // Input File Name
    const fileInput = document.getElementById('cv');
    const fileNameDisplay = document.getElementById('fileName');
    if (fileInput && fileNameDisplay) {
        fileInput.addEventListener('change', function () {
            if (this.files && this.files.length > 0) {
                fileNameDisplay.textContent = this.files[0].name;
                fileNameDisplay.style.color = "#ffffff";
                // Tenta limpar erro
                if (validators.pdf(this)) clearError(this);
            } else {
                fileNameDisplay.textContent = "Clique para selecionar arquivo PDF...";
                fileNameDisplay.style.color = "#94a3b8";
            }
        });
    }

    // Contador de Caracteres
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

    // Accordion & Scroll
    document.querySelectorAll(".accordion-header").forEach(header => {
        header.addEventListener("click", function () {
            this.classList.toggle("active");
            const panel = this.nextElementSibling;
            if (panel.style.maxHeight) panel.style.maxHeight = null;
            else panel.style.maxHeight = panel.scrollHeight + "px";
        });
    });

    const backToTopBtn = document.getElementById('backToTop');
    if (backToTopBtn) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) backToTopBtn.classList.add('show');
            else backToTopBtn.classList.remove('show');
        });
        backToTopBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    }
});

/* ============================================================
       9. LÓGICA DOS MODAIS (Legal / LGPD / Sobre)
    ============================================================ */
// Mapeamento dos Modais
const modalTermos = document.getElementById('modalTermos');
const modalPrivacidade = document.getElementById('modalPrivacidade');
const modalSobre = document.getElementById('modalSobre'); // NOVO

// Mapeamento dos Botões (Triggers)
const btnTermos = document.getElementById('btnTermos');
const btnPrivacidade = document.getElementById('btnPrivacidade');

// Botões do Sobre (Header e Footer)
const btnSobreNav = document.getElementById('btnSobreNav');     // NOVO
const btnSobreFooter = document.getElementById('btnSobreFooter'); // NOVO

// Botões de fechar (X)
const closeButtons = document.querySelectorAll('.modal-close');

// Função para abrir
const openModal = (modal) => {
    if (modal) {
        modal.style.display = 'flex';
        setTimeout(() => {
            modal.classList.add('active');
        }, 10);
        document.body.style.overflow = 'hidden';
    }
};

// Função para fechar
const closeModal = (modal) => {
    if (modal) {
        modal.classList.remove('active');
        setTimeout(() => {
            modal.style.display = 'none';
        }, 300);
        document.body.style.overflow = 'auto';
    }
};

// EVENTOS DE CLIQUE

// 1. Termos e Privacidade
if (btnTermos) {
    btnTermos.addEventListener('click', (e) => {
        e.preventDefault();
        openModal(modalTermos);
    });
}

if (btnPrivacidade) {
    btnPrivacidade.addEventListener('click', (e) => {
        e.preventDefault();
        openModal(modalPrivacidade);
    });
}

// 2. Sobre Nós (Header) - NOVO
if (btnSobreNav) {
    btnSobreNav.addEventListener('click', (e) => {
        e.preventDefault();
        openModal(modalSobre);
    });
}

// 3. Sobre Nós (Footer) - NOVO
if (btnSobreFooter) {
    btnSobreFooter.addEventListener('click', (e) => {
        e.preventDefault();
        openModal(modalSobre);
    });
}

// Fechar ao clicar no X
closeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        const modalId = btn.getAttribute('data-close');
        const modal = document.getElementById(modalId);
        closeModal(modal);
    });
});

// Fechar ao clicar fora
window.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal-overlay')) {
        closeModal(e.target);
    }
});

// Fechar com ESC
document.addEventListener('keydown', (e) => {
    if (e.key === "Escape") {
        const activeModal = document.querySelector('.modal-overlay.active');
        if (activeModal) closeModal(activeModal);
    }
});

const workForm = document.getElementById('workForm');
const btnSubmit = document.getElementById('btnSubmitWork');

if (workForm) {
    workForm.addEventListener('submit', function () {
        // Ativa o feedback visual de carregamento
        btnSubmit.classList.add('btn-loading');
        btnSubmit.innerText = "Enviando...";

        // O formulário seguirá o envio normal para o FormSubmit
    });
}

