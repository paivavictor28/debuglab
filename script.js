document.addEventListener('DOMContentLoaded', () => {

    /* 1. SCROLL RESET (F5) */
    if (history.scrollRestoration) {
        history.scrollRestoration = 'manual';
    } else {
        window.onbeforeunload = function () {
            window.scrollTo(0, 0);
        }
    }

    /* 2. ACORDEÃO (SIMPLES E FUNCIONAL) */
    const acc = document.querySelectorAll(".accordion-header");

    acc.forEach(botao => {
        botao.addEventListener("click", function () {
            // Fecha outros se quiser (opcional - aqui deixei independente)

            // Alterna classe visual
            this.classList.toggle("active");

            // Pega o conteúdo (o próximo elemento irmão)
            const painel = this.nextElementSibling;

            // Lógica de abrir/fechar
            if (painel.style.maxHeight) {
                painel.style.maxHeight = null; // Fecha
            } else {
                painel.style.maxHeight = painel.scrollHeight + "px"; // Abre
            }
        });
    });

    /* 3. BOTÃO VOLTAR AO TOPO (MOBILE) */
    const backToTopBtn = document.getElementById('backToTop');
    if (backToTopBtn) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) backToTopBtn.classList.add('show');
            else backToTopBtn.classList.remove('show');
        });
        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    /* --- 4. VALIDAÇÃO DO FORMULÁRIO (ATUALIZADA) --- */
    const contactForm = document.getElementById('contactForm');

    if (contactForm) {
        // Funções auxiliares
        const showError = (input, message) => {
            const inputGroup = input.parentElement;
            inputGroup.classList.add('error');
            const errorDisplay = inputGroup.querySelector('.error-msg');
            if (errorDisplay) {
                errorDisplay.innerText = message;
                errorDisplay.style.display = 'block';
            }
        };

        const clearError = (input) => {
            const inputGroup = input.parentElement;
            inputGroup.classList.remove('error');
            const errorDisplay = inputGroup.querySelector('.error-msg');
            if (errorDisplay) {
                errorDisplay.style.display = 'none';
            }
        };

        // Lógica de Envio
        contactForm.addEventListener('submit', function (e) {
            e.preventDefault();
            let isValid = true;
            let firstInvalidInput = null;

            // Elementos
            const nome = document.getElementById('nome');
            const empresa = document.getElementById('empresa');
            const email = document.getElementById('email');
            const telefone = document.getElementById('telefone');
            const mensagem = document.getElementById('mensagem');

            // 1. Validação Nome
            if (nome.value.trim().split(' ').length < 2) {
                showError(nome, "*Digite nome e sobrenome");
                isValid = false;
                if (!firstInvalidInput) firstInvalidInput = nome;
            } else { clearError(nome); }

            // 2. Validação Empresa
            if (empresa.value.trim() === "") {
                showError(empresa, "*Campo obrigatório");
                isValid = false;
                if (!firstInvalidInput) firstInvalidInput = empresa;
            } else { clearError(empresa); }

            // 3. Validação Email
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email.value.trim())) {
                showError(email, "*E-mail inválido");
                isValid = false;
                if (!firstInvalidInput) firstInvalidInput = email;
            } else { clearError(email); }

            // 4. Validação Telefone
            const phoneClean = telefone.value.replace(/\D/g, '');
            if (phoneClean.length < 10) {
                showError(telefone, "*Telefone incompleto");
                isValid = false;
                if (!firstInvalidInput) firstInvalidInput = telefone;
            } else { clearError(telefone); }

            // 5. Validação Mensagem
            if (mensagem.value.trim().length < 20) {
                showError(mensagem, "*Mínimo de 20 caracteres");
                isValid = false;
                if (!firstInvalidInput) firstInvalidInput = mensagem;
            } else {

                clearError(mensagem);
            }

            if (!isValid) {
                if (firstInvalidInput) {
                    firstInvalidInput.focus();
                    firstInvalidInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            } else {
                // SUCESSO!
                alert("Obrigado! Recebemos sua solicitação. (Simulação)");
                contactForm.reset();
                // Reseta o contador visualmente
                document.getElementById('charCount').textContent = "0 / 1000";
                document.getElementById('charCount').style.color = "#ffbd2e";
            }
        });

        // Máscara de Telefone e Contador de Caracteres (Mantidos)
        const telInput = document.getElementById('telefone');
        if (telInput) {
            telInput.addEventListener('input', function (e) {
                let x = e.target.value.replace(/\D/g, '').match(/(\d{0,2})(\d{0,5})(\d{0,4})/);
                e.target.value = !x[2] ? x[1] : '(' + x[1] + ') ' + x[2] + (x[3] ? '-' + x[3] : '');
            });
        }

        const msgInput = document.getElementById('mensagem');
        const charCountDisplay = document.getElementById('charCount');
        if (msgInput && charCountDisplay) {
            msgInput.addEventListener('input', function () {
                const len = this.value.length;
                charCountDisplay.textContent = `${len} / 1000`;

                if (len >= 20) { // Alterado aqui também
                    charCountDisplay.style.color = "#27c93f"; // Verde
                    clearError(this);
                } else {
                    charCountDisplay.style.color = "#ffbd2e";
                }
            });
        }
    }
});