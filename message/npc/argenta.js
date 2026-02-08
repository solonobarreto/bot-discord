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

const dataFile = path.join(__dirname, '../data/', 'argentaMessageData.json');  // Caminho corrigido para data/

// Mapa de emojis para IDs de cargos (use ID do emoji como chave para customizados)
const roleMap = {
    // emojin_id : cargo_id
    '1469883391649386586': '1469849508484485296',  // volcano ordeal
    '1469883293829693440': '1469848463423574196',  // typhoon & prof.k hardcore
    '1469883138917536010': '1469845141845053502',  // desert dragon
    '1469883347638554809': '1469847910312185916',  // red dragon normal
    '1469883196983214172': '1469848633833685164',  // red dragon hardcore
};

// Mapa auxiliar para nomes de emojis (para reações corretas)
const emojiNames = {
    '1469883391649386586': 'volcanoordeal',
    '1469883293829693440': 'typhoonprofessor',
    '1469883138917536010': 'desertdragon',
    '1469883347638554809': 'reddragonnormal',
    '1469883196983214172': 'reddragonhardcore',
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
        title: 'Freedom Community',
        color: 0xf1c40f,  // Cor amarelo dourado (#f1c40f)
        description: 'Im here to help with the selection\n of **Raid-Type** content.',
        fields: [
            {
                name: 'Select below:\n',  // Segundo bloco
                value: `
                <:volcanoordeal:1469883391649386586> Volcano Ordeal
                <:typhoonprofessor:1469883293829693440> Typhoon & Prof. K Hardcore
                <:desertdragon:1469883138917536010> Desert Dragon Hardcore
                <:reddragonnormal:1469883347638554809> Red Dragon Normal
                <:reddragonhardcore:1469883196983214172> Red Dragon Hardcore
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
    console.log(`Bot ${client.user.tag} está online!`);
});

// Comando para postar a mensagem de reações
client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    if (message.content === '!raidroles') {
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
            message.reply('Mensagem de reações deletada! Use !raidroles para criar uma nova.');
        } catch (error) {
            message.reply(`Erro ao resetar: ${error.message}`);
        }
    }
});

// Atribuir cargo ao reagir (com logs detalhados)
client.on('messageReactionAdd', async (reaction, user) => {
    console.log(`[Argenta] Evento messageReactionAdd disparado para usuário: ${user.tag}`);
    console.log(`[Argenta] Emoji reagido: ${reaction.emoji.name || reaction.emoji.id}`);
    console.log(`[Argenta] ID da mensagem reagida: ${reaction.message.id}`);
    console.log(`[Argenta] ReactionMessageId esperado: ${reactionMessageId}`);
    
    if (user.bot) {
        console.log(`[Argenta] Usuário é bot, ignorando.`);
        return;
    }
    
    if (reaction.message.id !== reactionMessageId) {
        console.log(`[Argenta] Mensagem não corresponde à esperada, ignorando.`);
        return;
    }
    
    console.log(`[Argenta] Mensagem validada, processando reação.`);
    
    const emojiId = reaction.emoji.id || reaction.emoji.name;
    console.log(`[Argenta] Emoji ID detectado: ${emojiId}`);
    
    const roleId = roleMap[emojiId];
    console.log(`[Argenta] Role ID mapeado: ${roleId}`);
    
    if (!roleId) {
        console.log(`[Argenta] Role ID vazio ou não mapeado, pulando.`);
        return;
    }
    
    const guild = reaction.message.guild;
    console.log(`[Argenta] Guild ID: ${guild.id}`);
    
    const member = await guild.members.fetch(user.id);
    console.log(`[Argenta] Membro encontrado: ${member.user.tag}`);
    
    const role = guild.roles.cache.get(roleId);
    if (!role) {
        console.log(`[Argenta] Cargo não encontrado no cache do guild.`);
        return;
    }
    
    console.log(`[Argenta] Tentando atribuir cargo: ${role.name}`);
    
    try {
        await member.roles.add(role);
        console.log(`[Argenta] Cargo ${role.name} atribuído com sucesso a ${user.tag}`);
    } catch (error) {
        console.error(`[Argenta] Erro ao atribuir cargo: ${error.message}`);
    }
});

// Remover cargo ao remover reação
client.on('messageReactionRemove', async (reaction, user) => {
    console.log(`[Argenta] Evento messageReactionRemove disparado para usuário: ${user.tag}`);
    console.log(`[Argenta] Emoji removido: ${reaction.emoji.name || reaction.emoji.id}`);
    console.log(`[Argenta] ID da mensagem reagida: ${reaction.message.id}`);
    console.log(`[Argenta] ReactionMessageId esperado: ${reactionMessageId}`);
    
    if (user.bot) {
        console.log(`[Argenta] Usuário é bot, ignorando.`);
        return;
    }
    
    if (reaction.message.id !== reactionMessageId) {
        console.log(`[Argenta] Mensagem não corresponde à esperada, ignorando.`);
        return;
    }
    
    console.log(`[Argenta] Mensagem validada, processando remoção de reação.`);
    
    const emojiId = reaction.emoji.id || reaction.emoji.name;
    console.log(`[Argenta] Emoji ID detectado: ${emojiId}`);
    
    const roleId = roleMap[emojiId];
    console.log(`[Argenta] Role ID mapeado: ${roleId}`);
    
    if (!roleId) {
        console.log(`[Argenta] Role ID vazio ou não mapeado, pulando.`);
        return;
    }
    
    const guild = reaction.message.guild;
    console.log(`[Argenta] Guild ID: ${guild.id}`);
    
    const member = await guild.members.fetch(user.id);
    console.log(`[Argenta] Membro encontrado: ${member.user.tag}`);
    
    const role = guild.roles.cache.get(roleId);
    if (!role) {
        console.log(`[Argenta] Cargo não encontrado no cache do guild.`);
        return;
    }
    
    console.log(`[Argenta] Tentando remover cargo: ${role.name}`);
    
    try {
        await member.roles.remove(role);
        console.log(`[Argenta] Cargo ${role.name} removido com sucesso de ${user.tag}`);
    } catch (error) {
        console.error(`[Argenta] Erro ao remover cargo: ${error.message}`);
    }
});

client.login(process.env.TOKEN_ARGENTA);