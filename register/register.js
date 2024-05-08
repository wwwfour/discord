const fs = require('fs');
const { ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } = require('discord.js');

module.exports = {
    name: 'register',
    description: 'register',
    async execute (message, args) {
        let nomad = "UNREGISTER_ROLE_ID";
        let woman = "WOMAN_ROLE_ID";
        let man = "MAN_ROLE_ID";
        let REG_DATA_PATH = "./regData.json";

        function getXP(userId) {
            try {
                const xpData = JSON.parse(fs.readFileSync(REG_DATA_PATH));
                return xpData[userId]?.REGISTER_COUNT || 0;
            } catch (err) {
                console.error('Error reading XP file:', err);
                return 0;
            }
        }

        function saveXP(userId) {
            try {
                let xpData = {};
                if (fs.existsSync(REG_DATA_PATH)) {
                    xpData = JSON.parse(fs.readFileSync(REG_DATA_PATH));
                }
                xpData[userId] = xpData[userId] || {};
                xpData[userId].REGISTER_COUNT = (xpData[userId].REGISTER_COUNT ?? 0) + 1; // Kullanıcının XP değerini 1 artır
                fs.writeFileSync(REG_DATA_PATH, JSON.stringify(xpData, null, 2));
            } catch (err) {
                console.error('Error saving Register file:', err);
            }
        }

        function setRegister(userId, isim, yas, gender) {
            try {
                let xpData = {};
                if (fs.existsSync(REG_DATA_PATH)) {
                    xpData = JSON.parse(fs.readFileSync(REG_DATA_PATH));
                }
                xpData[userId] = xpData[userId] || {};
                xpData[userId].REGISTERCHECK = "1" // Kullanıcının XP değerini 1 artır
                xpData[userId].NAME = isim; // Kullanıcının adını ayarla
                xpData[userId].AGE = yas; // Kullanıcının yaşını ayarla
                xpData[userId].GENDER = gender; // Kullanıcının cinsiyetini ayarla
                fs.writeFileSync(REG_DATA_PATH, JSON.stringify(xpData, null, 2));
            } catch (err) {
                console.error('Error saving Register file:', err);
            }
        }

        let isAdmin = message.member.roles.cache.some(role => role.id === "REGISTER_STAFF");
        if (!isAdmin) return message.reply("You are not a staff!");

        let finalResult
        let staff = message.author.id;
        let serverMemberId = args[0];
        let isim = args[1];
        let yas = args[2];
        if (!isim) return message.reply("Nick?");
        if (!yas) return message.reply("Age?");
        finalResult=serverMemberId
        if (isim) {
            isim = isim.charAt(0).toUpperCase() + isim.slice(1);
        }

        if(serverMemberId.toString().includes("<")) {
          let testT = serverMemberId.toString();
          let substringResult = testT.substring(2); 
          finalResult = substringResult.substring(0, substringResult.length - 1); 
        }
        let checkID = message.guild.members.cache.get(finalResult);
        if (!checkID) return message.reply("Geçersiz ID");


        const select = new StringSelectMenuBuilder()
            .setCustomId('register')
            .setPlaceholder('Genders')
            .addOptions(
                new StringSelectMenuOptionBuilder()
                    .setLabel('Male')
                    .setEmoji("♂️")
                    .setValue('male'),
                new StringSelectMenuOptionBuilder()
                    .setLabel('Female')
                    .setEmoji("♀️")
                    .setValue('female'),
            );

        const row = new ActionRowBuilder()
            .addComponents(select);

        await message.reply({
            content: 'Cinsiyeti seçiniz!',
            components: [row],
        });

        const collector = message.channel.createMessageComponentCollector({ time: 15000 });

        collector.on('collect', async i => {
            if (i.user.id === message.author.id) {
                if (i.values[0] === "male") {
                     await checkID.roles.add(man);
                    await checkID.roles.remove(nomad);
                    await saveXP(staff);
                     await setRegister(checkID.id, isim, yas, "male");
                     await checkID.setNickname("✰ | " + isim + " " + yas)
                        .then(updatedMember => console.log(`Nick Update: ${updatedMember.displayName}`))
                        .catch(error => console.error('Nick Update Error:', error));
                    await i.reply("OK!").catch(error => console.error('interaction err:', error));
                } else if (i.values[0] === "female") {
                    await checkID.roles.add(woman);
                     await checkID.roles.remove(nomad);
                  await saveXP(staff);
                     await setRegister(checkID.id, isim, yas, "female");
                     checkID.setNickname("✰ | " + isim + " " + yas)
                        .then(updatedMember => console.log(`Nick Update: ${updatedMember.displayName}`))
                        .catch(error => console.error('Nick Update Error:', error));
                    await i.reply("OK!").catch(error => console.error('interaction err:', error));
                }
            } else {
                await i.reply({ content: `It's not for you!`, ephemeral: true }).catch(error => console.error('interaction err:', error));
            }
        });

        collector.on('end', collected => {
            console.log(`Collected ${collected.size} interactions.`);
        });
    }
};
