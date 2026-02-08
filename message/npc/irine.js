const { Client, GatewayIntentBits } = require('discord.js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();  // Adicionado para carregar o .env localmente

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.MessageContent,
    ],
});

const dataFile = path.join(__dirname, '../data/', 'irineMessageData.json');  // Caminho corrigido para data/

// Mapa de emojis para IDs de cargos (use ID do emoji como chave para customizados)
const roleMap = {
    // emojin_id : cargo_id
    '1469883432128745572': '1469848979784339507',  // dragon fellowship
    '1469883484653748478': '1469848862750543995',  // duel dragon
    '1469883699783799048': '1469866935792570459',  // monastery circus
    '1469883512252399821': '1469867094433857701',  // red dragon memorial
    '1469883744709120166': '1469867306661187747',  // stronghold
    '1469883781270864036': '1469867060845744198',  // third core
    '1469883823155052616': '1469866857543766037',  // volcano
};

// Mapa auxiliar para nomes de emojis (para reações corretas)
const emojiNames = {
    '1469883432128745572': 'dragonfellowship',
    '1469883484653748478': 'dueldragon',
    '1469883699783799048': 'monasterycircus',
    '1469883512252399821': 'memorial',
    '1469883744709120166': 'stronghold',
    '1469883781270864036': 'thirdcore',
    '1469883823155052616': 'volcano',
};

// Carrega dados do arquivo JSON
function loadData() {
    if (fs.existsSync(dataFile)) {
        const data = fs.readFileSync(dataFile, 'utf8');
        return JSON.parse(data);
    }
    return { reactionMessageId: null, channelId: null };
}

// Salva dados no arquivo JSON
function saveData(data) {
    fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
}

// Cria a mensagem de reações
async function createReactionMessage(channel) {
    const embed = {
        title: 'My name is Irine.',
        color: 0xf1c40f,  // Cor amarelo dourado (#f1c40f)
        description: 'Im here to help with the selection\n of **Speed-Type** content.',
        fields: [
            {
                name: 'Select below:\n',  // Segundo bloco
                value: `
                <:dragonfellowship:1469883432128745572> Dragon Fellowship
                <:dueldragon:1469883484653748478> Duel Dragon
                <:monasterycircus:1469883699783799048> Monastery Circus
                <:memorial:1469883512252399821> Red Dragon Memorial
                <:stronghold:1469883744709120166> Stronghold
                <:thirdcore:1469883781270864036> Third Core
                <:volcano:1469883823155052616> Volcano
                `,
                inline: false,
            },
        ],
        footer: { text: 'React to assign/remove your class role.' },
    };

    const sentMessage = await channel.send({ embeds: [embed] });

    // Removido: Não adiciona reações automaticamente
    // Os usuários reagirão manualmente com os emojis listados no embed

    // Salva IDs
    const data = loadData();
    data.reactionMessageId = sentMessage.id;
    data.channelId = channel.id;
    saveData(data);
    reactionMessageId = sentMessage.id;  // Atualiza a variável global
    console.log(`Mensagem salva: ID ${sentMessage.id}, Canal ${channel.id}`);
    console.log(`ReactionMessageId atualizado para: ${reactionMessageId}`);

    return sentMessage;
}

// Deleta a mensagem de reações (para reset)
async function deleteReactionMessage() {
    const data = loadData();
    if (!data.reactionMessageId || !data.channelId) {
        throw new Error('Nenhuma mensagem de reações encontrada para deletar.');
    }

    const channel = client.channels.cache.get(data.channelId);
    if (!channel) throw new Error('Canal não encontrado.');

    const message = await channel.messages.fetch(data.reactionMessageId);
    if (message) {
        await message.delete();
    }

    // Limpa dados
    data.reactionMessageId = null;
    data.channelId = null;
    saveData(data);
    reactionMessageId = null;  // Atualiza a variável global
}

// Obtém o ID da mensagem atual
function getReactionMessageId() {
    const data = loadData();
    return data.reactionMessageId;
}

let reactionMessageId = getReactionMessageId();  // Carrega do arquivo JSON
console.log(`ReactionMessageId carregado: ${reactionMessageId}`);

client.once('ready', () => {
    console.log(`Bot Irine ${client.user.tag} está online!`);
});

// Comando para postar a mensagem de reações
client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    if (message.content === '!speedroles') {
        if (!message.member.permissions.has('ManageRoles')) {
            return message.reply('Você não tem permissão para configurar cargos.');
        }

        try {
            await createReactionMessage(message.channel);
            message.reply('Mensagem de reações configurada!');
        } catch (error) {
            message.reply(`Erro ao configurar: ${error.message}`);
        }
    }

    if (message.content === '!resetroles') {
        if (!message.member.permissions.has('ManageRoles')) {
            return message.reply('Você não tem permissão para resetar cargos.');
        }

        try {
            await deleteReactionMessage();
            message.reply('Mensagem de reações deletada! Use !speedroles para criar uma nova.');
        } catch (error) {
            message.reply(`Erro ao resetar: ${error.message}`);
        }
    }
});

// Atribuir cargo ao reagir (com logs detalhados)
client.on('messageReactionAdd', async (reaction, user) => {
    console.log(`[Irine] Evento messageReactionAdd disparado para usuário: ${user.tag}`);
    console.log(`[Irine] Emoji reagido: ${reaction.emoji.name || reaction.emoji.id}`);
    console.log(`[Irine] ID da mensagem reagida: ${reaction.message.id}`);
    console.log(`[Irine] ReactionMessageId esperado: ${reactionMessageId}`);
    
    if (user.bot) {
        console.log(`[Irine] Usuário é bot, ignorando.`);
        return;
    }
    
    if (reaction.message.id !== reactionMessageId) {
        console.log(`[Irine] Mensagem não corresponde à esperada, ignorando.`);
        return;
    }
    
    console.log(`[Irine] Mensagem validada, processando reação.`);
    
    const emojiId = reaction.emoji.id || reaction.emoji.name;
    console.log(`[Irine] Emoji ID detectado: ${emojiId}`);
    
    const roleId = roleMap[emojiId];
    console.log(`[Irine] Role ID mapeado: ${roleId}`);
    
    if (!roleId) {
        console.log(`[Irine] Role ID vazio ou não mapeado, pulando.`);
        return;
    }
    
    const guild = reaction.message.guild;
    console.log(`[Irine] Guild ID: ${guild.id}`);
    
    const member = await guild.members.fetch(user.id);
    console.log(`[Irine] Membro encontrado: ${member.user.tag}`);
    
    const role = guild.roles.cache.get(roleId);
    if (!role) {
        console.log(`[Irine] Cargo não encontrado no cache do guild.`);
        return;
    }
    
    console.log(`[Irine] Tentando atribuir cargo: ${role.name}`);
    
    try {
        await member.roles.add(role);
        console.log(`[Irine] Cargo ${role.name} atribuído com sucesso a ${user.tag}`);
    } catch (error) {
        console.error(`[Irine] Erro ao atribuir cargo: ${error.message}`);
    }
});

// Remover cargo ao remover reação
client.on('messageReactionRemove', async (reaction, user) => {
    console.log(`[Irine] Evento messageReactionRemove disparado para usuário: ${user.tag}`);
    console.log(`[Irine] Emoji removido: ${reaction.emoji.name || reaction.emoji.id}`);
    console.log(`[Irine] ID da mensagem reagida: ${reaction.message.id}`);
    console.log(`[Irine] ReactionMessageId esperado: ${reactionMessageId}`);
    
    if (user.bot) {
        console.log(`[Irine] Usuário é bot, ignorando.`);
        return;
    }
    
    if (reaction.message.id !== reactionMessageId) {
        console.log(`[Irine] Mensagem não corresponde à esperada, ignorando.`);
        return;
    }
    
    console.log(`[Irine] Mensagem validada, processando remoção de reação.`);
    
    const emojiId = reaction.emoji.id || reaction.emoji.name;
    console.log(`[Irine] Emoji ID detectado: ${emojiId}`);
    
    const roleId = roleMap[emojiId];
    console.log(`[Irine] Role ID mapeado: ${roleId}`);
    
    if (!roleId) {
        console.log(`[Irine] Role ID vazio ou não mapeado, pulando.`);
        return;
    }
    
    const guild = reaction.message.guild;
    console.log(`[Irine] Guild ID: ${guild.id}`);
    
    const member = await guild.members.fetch(user.id);
    console.log(`[Irine] Membro encontrado: ${member.user.tag}`);
    
    const role = guild.roles.cache.get(roleId);
    if (!role) {
        console.log(`[Irine] Cargo não encontrado no cache do guild.`);
        return;
    }
    
    console.log(`[Irine] Tentando remover cargo: ${role.name}`);
    
    try {
        await member.roles.remove(role);
        console.log(`[Irine] Cargo ${role.name} removido com sucesso de ${user.tag}`);
    } catch (error) {
        console.error(`[Irine] Erro ao remover cargo: ${error.message}`);
    }
});

client.login(process.env.TOKEN_IRINE);