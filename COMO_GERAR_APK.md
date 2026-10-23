# Como gerar o APK pelo celular (GitHub, grátis, sem fila)

O GitHub compila o APK nos servidores dele. O celular só envia o código.
Você precisa de uma conta gratuita em github.com e do Termux (F-Droid).

## Primeira vez

1. Baixe o `carimbo-v3.zip` para a pasta Downloads.
2. No Termux, rode um bloco de cada vez:

```
pkg install -y git gh unzip
termux-setup-storage
```

```
cd ~ && rm -rf carimbo
unzip -q "$(ls -t ~/storage/downloads/carimbo-v3*.zip | head -1)"
cd carimbo
git init -q -b main && git add -A && git commit -qm "Carimbo v3"
```

```
gh auth login
```
Responda: **GitHub.com** → **HTTPS** → **Y** → **Login with a web browser**.
Ele mostra um código de 8 letras: copie, abra o link github.com/login/device no navegador, cole o código e autorize.

```
gh repo create carimbo --public --source=. --push
```

3. Abra `github.com/SEU-USUARIO/carimbo/actions` no navegador.
   A tarefa **Gerar APK** roda sozinha e leva uns 10 a 15 minutos.
4. Quando ficar verde, abra `github.com/SEU-USUARIO/carimbo/releases`
   e toque em **carimbo.apk** para baixar e instalar.

## Próximas versões

Baixe o zip novo e rode:
```
cd ~ && cp -r carimbo/.git /tmp/carimbo-git && rm -rf carimbo
unzip -q "$(ls -t ~/storage/downloads/carimbo-v*.zip | head -1)"
mv /tmp/carimbo-git carimbo/.git && cd carimbo
git add -A && git commit -qm "Nova versão" && git push
```
O APK novo aparece no mesmo lugar, em Releases.

## Se der erro
- Na aba **Actions**, toque na tarefa em vermelho e depois na etapa com X. Mande um print da mensagem.
- `gh: command not found`: rode `pkg install -y gh`.
- Para gerar de novo sem mudar nada: em Actions, abra **Gerar APK** e toque em **Run workflow**.

## O que testar
1. No app Arquivos, segure um `.json`, toque em **Compartilhar** e escolha **Carimbo**: a roda deve abrir por cima do app Arquivos.
2. Deslize o dedo até um formato e solte: converte na hora.
3. Toque num formato e depois no centro: também converte.
4. **Fechar** ou **Cancelar** devem voltar ao app Arquivos.
5. Pelo ícone do app: **Escolher arquivo** e **Converter texto copiado**.
