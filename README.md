[Try it out!](https://vibeo.video/)  
[GitHub repo](https://github.com/MiniHacks/vibeo)

# Vibeo
*Reinventing your notebook.*

## Inspiration

Have you ever frantically leafed through 1700 pages of notes during an quiz, trying to find wherever you wrote about isoefficiencies? 

That would *probably* be a good use-case for this project, but what do I know?

More realistically, if you're anything like us, you didn't take notes, possibly didn't even attend class, and if you slacked particularly hard you might be binging 7 lecture videos immediately before the exam.

How do you pull that off? With **Vibeo**.

## What does it do?

**Vibeo** is a knowledge base that allows you to store videos, write notes on them or even annotate on the video, and then query everything with natural language. You can even share your vaults, taking notes with your friends, an *incredibly* common college student pastime. *Woo,* real-time collaboration.

Y'know how everything expects a wifi connection nowadays? 
It also (mostly) works offline! You can still search, upload videos, draw on them, and all that fun stuff. If you're like me, your vault will even still have the same number of collaborators!

(We use LLMs to synthesize information across videos but it's just *barely* infeasible to run a 30B parameter model on an M1 Mac. Our 13B model was not very cooperative.)


## How we built it
**Frontend:** We crafted the frontend using **Typescript**, **React**, and **Next.js**, with **Chakra UI** as our primary component library and **Framer Motion** for all the sexy animations. We also used the **QRcode** library for generating QR code invitations into others’ sessions. The website was deployed with **Caddy**.

**Backend:** A **FastAPI REST microservice** that transcribes videos using a **VAD + Whisper** pipeline then ingests videos into **Firebase** (synced with a local emulator) and hierarchically embeds parts of the transcript for insertion into **Chroma**, a vector database. Searches are done with query embeddings with optional LLM-driven synthesis. We tried **LLaMA** and **Alpaca LORA** 7B and 13B locally but the results were low-quality (and 30B was too big).  

**Infrastructure:** We deploy using **GitHub actions** to automatically SSH into a server and build our frontend on push. Our backend is deployed to UMN ACM's server because free 3080 == not paying for a 3080. The server runs **Nix** so we have procedural builds. Additionally, we made life more difficult for ourselves by writing a **GitHub** pre-commit hook that requires all commits to begin with emojis.

## Challenges we ran into

- Whisper hallucinates if given stretches of audio without speech, thus we added the voice activity layer. Then we started having OOM problems so we had to binarize and split the input into chunks.
- It is *nearly* possible to run a proper LLM locally. 7B did not want to cooperate with our output formats, 13B was slightly perverted (woo, dubious finetuning), and 30B was too large. Really cool that open source weights exist.
- Working with Nix always makes installing packages a joy once the scripts are done but quite painful before that.
- Our rigorous PR process and commit etiquette:
![](https://media.discordapp.net/attachments/1082467092718174217/1091910047124172881/image.png?width=1060&height=1340)

## Future Updates
- Real-time video support
- Sasha can use the banger annotation figure to learn to dance or something
- *someone* can impress their significant other
- `rm -rf`?
