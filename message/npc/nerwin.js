const { Client, GatewayIntentBits } = require('discord.js');
const fs = require('fs');
const path = require('path');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.MessageContent,
    ],
});

const dataFile = path.join(__dirname, '../data/', 'nerwinMessageData.json');  // Caminho corrigido para data/

// Mapa de emojis para IDs de cargos (chaves: IDs de emojis, valores: IDs de cargos)
const roleMap = {
    // emoji_id : cargo_id
    '1424611100842004490': '1469894337490845718',  // moonlord
    '1424611093959020564': '1469894442952560640',  // gladiator
    '1424609685360738314': '1469894471356252171',  // barbarian
    '1424611079950172264': '1469894540239437982',  // destroyer
    '1424610973993537536': '1469894564390244643',  // darkavenger
    '1424611128054513684': '1469894595063320669',  // sentinel
    '1424611130483015830': '1469894630358126694',  // sniper
    '1424612183739863071': '1469894656014680106',  // tempest
    '1424611137076596756': '1469894685932912822',  // windwalker
    '1424611092549865573': '1469894715670396988',  // glaciana
    '1442563843128688650': '1469894778958123105',  // saleana
    '1424611096463015946': '1469894844133675018',  // ilumia
    '1424611102918049832': '1469894871178285077',  // obscuria
    '1424611095200530494': '1469894944800899112',  // guardian
    '1424609650065674291': '1469894966699495496',  // crusader
    '1424611097641619468': '1469894994730156175',  // inquisitor
    '1424611122828415057': '1469895021544079513',  // saint
    '1424609767032361010': '1469895047578124339',  // adept
    '1424611106936193065': '1469895076984524810',  // physician
    '1424611120487993384': '1469895107346956289',  // shootingstar
    '1424611091299696783': '1469895141069164585',  // gearmaster
    '1424611117770215524': '1469895185990160566',  // souleater
    '1424611077764943973': '1469895227149127715',  // darksummoner
    '1424612618835857418': '1469895267779346482',  // spiritdancer
    '1424609718399271034': '1469895298040991879',  // bladedancer
    '1424611099256553513': '1469895321680347422',  // lightfury
    '1424609580335501352': '1469895365082742824',  // abysswalker
    '1424611109184213072': '1469895393428115466',  // raven
    '1424612022783447110': '1469895417448759543',  // ripper
    '1424611134744301588': '1469895440651780378',  // valkyria
    '1424611082877669397': '1469895479029399605',  // flurry
    '1424611113022132285': '1469895502823817216',  // ruina
    '1424612387931291689': '1469895522906144942',  // defensio
};

// Mapa auxiliar para nomes de emojis (chaves: IDs de emojis, valores: nomes)
const emojiNames = {
    '1424611100842004490': 'Moonlord',  // moonlord
    '1424611093959020564': 'Gladiator',  // gladiator
    '1424609685360738314': 'Barbarian',  // barbarian
    '1424611079950172264': 'Destroyer',  // destroyer
    '1424610973993537536': 'DarkAvenger',  // darkavenger
    '1424611128054513684': 'Sentinel',  // sentinel
    '1424611130483015830': 'Sniper',  // sniper
    '1424612183739863071': 'Tempest',  // tempest
    '1424611137076596756': 'WindWalker',  // windwalker
    '1424611092549865573': 'Glaciana',  // glaciana
    '1442563843128688650': 'Saleana',  // saleana
    '1424611096463015946': 'Ilumia',  // ilumia
    '1424611102918049832': 'Obscuria',  // obscuria
    '1424611095200530494': 'Guardian',  // guardian
    '1424609650065674291': 'Crusader',  // crusader
    '1424611097641619468': 'Inquisitor',  // inquisitor
    '1424611122828415057': 'Saint',  // saint
    '1424609767032361010': 'Adept',  // adept
    '1424611106936193065': 'Physician',  // physician
    '1424611120487993384': 'ShootingStar',  // shootingstar
    '1424611091299696783': 'GearMaster',  // gearmaster
    '1424611117770215524': 'SoulEater',  // souleater
    '1424611077764943973': 'DarkSummoner',  // darksummoner
    '1424612618835857418': 'SpiritDancer',  // spiritdancer
    '1424609718399271034': 'BladeDancer',  // bladedancer
    '1424611099256553513': 'LightFury',  // lightfury
    '1424609580335501352': 'AbyssWalker',  // abysswalker
    '1424611109184213072': 'Raven',  // raven
    '1424612022783447110': 'Ripper',  // ripper
    '1424611134744301588': 'Valkyrie',  // valkyria
    '1424611082877669397': 'Flurry',  // flurry
    '1424611113022132285': 'Ruina',  // ruina
    '1424612387931291689': 'Defensio',  // defensio
};

// Definição dos grupos com seus emojis
const groups = {
    Warrior: ['1424611100842004490', '1424611093959020564', '1424609685360738314', '1424611079950172264', '1424610973993537536'],
    Archer: ['1424611128054513684', '1424611130483015830', '1424612183739863071', '1424611137076596756'],
    Sorcerss: ['1424611092549865573', '1442563843128688650', '1424611096463015946', '1424611102918049832'],
    Cleric: ['1424611095200530494', '1424609650065674291', '1424611097641619468', '1424611122828415057'],
    Academic: ['1424609767032361010', '1424611106936193065', '1424611120487993384', '1424611091299696783'],
    Kali: ['1424611117770215524', '1424611077764943973', '1424612618835857418', '1424609718399271034'],
    Assassin: ['1424611099256553513', '1424609580335501352', '1424611109184213072', '1424612022783447110'],
    Lancea: ['1424611134744301588', '1424611082877669397'],
    Machina: ['1424611113022132285', '1424612387931291689'],
};

// Carrega dados do arquivo JSON (agora uma array de objetos; migra formato antigo)
function loadData() {
    if (fs.existsSync(dataFile)) {
        const data = fs.readFileSync(dataFile, 'utf8');
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed)) {
            return parsed;  // Formato novo
        } else {
            // Formato antigo (objeto): migra para array vazia
            console.log('Formato antigo detectado. Migrando para array vazia.');
            return [];
        }
    }
    return [];
}

// Salva dados no arquivo JSON
function saveData(data) {
    fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
}

// Cria as mensagens de reações (uma por grupo)
async function createReactionMessages(channel) {
    const messagesData = [];

    for (const [groupName, emojis] of Object.entries(groups)) {
        const embed = {
            title: `My name is Nerwin.`,
            color: 0xf1c40f,
            description: `
            Choose the category-**${groupName}**\nclass you are playing.`,  // Removido "class" da descrição
            fields: [
                {
                    name: '',
                    value: emojis.map(emojiId => `<:${emojiNames[emojiId]}:${emojiId}> ${emojiNames[emojiId]}`).join('\n'),
                    inline: false,
                },
            ],
            footer: { text: 'React to assign/remove your class role.' },
        };

        const sentMessage = await channel.send({ embeds: [embed] });

        // Removido: Não adiciona reações automaticamente
        // Os usuários reagirão manualmente com os emojis listados

        messagesData.push({ messageId: sentMessage.id, group: groupName, channelId: channel.id });
        console.log(`Mensagem para ${groupName} criada: ID ${sentMessage.id}`);
    }

    // Salva todas as mensagens
    saveData(messagesData);
    // Atualiza a lista global de messageIds
    reactionMessageIds = getReactionMessageIds();
    console.log('Todas as mensagens salvas e lista atualizada.');
}

// Deleta todas as mensagens de reações
async function deleteReactionMessages() {
    const messagesData = loadData();
    if (messagesData.length === 0) {
        throw new Error('Nenhuma mensagem de reações encontrada para deletar.');
    }

    for (const { messageId, group, channelId } of messagesData) {
        try {
            const channel = client.channels.cache.get(channelId);
            if (!channel) {
                console.error(`Canal ${channelId} não encontrado para ${group}.`);
                continue;
            }
            const message = await channel.messages.fetch(messageId);
            if (message) {
                await message.delete();
                console.log(`Mensagem de ${group} deletada: ID ${messageId}`);
            }
        } catch (error) {
            console.error(`Erro ao deletar mensagem ${messageId}: ${error.message}`);
        }
    }

    // Limpa dados
    saveData([]);
    // Atualiza a lista global de messageIds
    reactionMessageIds = [];
}

// Obtém a lista de messageIds válidos
function getReactionMessageIds() {
    const data = loadData();
    return data.map(item => item.messageId);
}

let reactionMessageIds = getReactionMessageIds();  // Carrega do arquivo JSON
console.log(`ReactionMessageIds carregados: ${reactionMessageIds.join(', ')}`);

client.once('ready', () => {
    console.log(`Bot Nerwin ${client.user.tag} está online!`);
});

// Comando para postar as mensagens de reações
client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    if (message.content === '!classroles') {
        if (!message.member.permissions.has('ManageRoles')) {
            return message.reply('Você não tem permissão para configurar cargos.');
        }

        try {
            await createReactionMessages(message.channel);
            message.reply('Mensagens de reações configuradas!');
        } catch (error) {
            message.reply(`Erro ao configurar: ${error.message}`);
        }
    }

    if (message.content === '!resetroles') {
        if (!message.member.permissions.has('ManageRoles')) {
            return message.reply('Você não tem permissão para resetar cargos.');
        }

        try {
            await deleteReactionMessages();
            message.reply('Mensagens de reações deletadas! Use !classroles para criar novas.');
        } catch (error) {
            message.reply(`Erro ao resetar: ${error.message}`);
        }
    }
});

// Atribuir cargo ao reagir
client.on('messageReactionAdd', async (reaction, user) => {
    console.log(`Reação detectada: ${reaction.emoji.name || reaction.emoji.id} por ${user.tag}`);
    console.log(`Message ID: ${reaction.message.id}, ReactionMessageIds: ${reactionMessageIds.join(', ')}`);
    if (user.bot) return;
    if (!reactionMessageIds.includes(reaction.message.id)) {
        console.log('Mensagem não corresponde');
        return;
    }

    const emojiId = reaction.emoji.id || reaction.emoji.name;
    console.log(`Emoji ID detectado: ${emojiId}`);
    const roleId = roleMap[emojiId];
    console.log(`Role ID mapeado: ${roleId}`);
    if (!roleId) {
        console.log('Role ID vazio, pulando');
        return;
    }

    const guild = reaction.message.guild;
    const member = await guild.members.fetch(user.id);
    const role = guild.roles.cache.get(roleId);
    if (!role) {
        console.log('Cargo não encontrado');
        return;
    }

    try {
        await member.roles.add(role);
        console.log(`Cargo ${role.name} atribuído a ${user.tag}`);
    } catch (error) {
        console.error(`Erro ao atribuir cargo: ${error.message}`);
    }
});

// Remover cargo ao remover reação
client.on('messageReactionRemove', async (reaction, user) => {
    console.log(`Reação removida: ${reaction.emoji.name || reaction.emoji.id} por ${user.tag}`);
    if (user.bot) return;
    if (!reactionMessageIds.includes(reaction.message.id)) return;

    const emojiId = reaction.emoji.id || reaction.emoji.name;
    const roleId = roleMap[emojiId];
    if (!roleId) return;

    const guild = reaction.message.guild;
    const member = await guild.members.fetch(user.id);
    const role = guild.roles.cache.get(roleId);
    if (!role) return;

    try {
        await member.roles.remove(role);
        console.log(`Cargo ${role.name} removido de ${user.tag}`);
    } catch (error) {
        console.error(`Erro: ${error.message}`);
    }
});

// Inicia o servidor HTTP
startServer();

client.login(process.env.TOKEN_NERWIN);