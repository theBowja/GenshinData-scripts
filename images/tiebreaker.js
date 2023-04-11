
/**
 * For images that may need to be updated in the future.
 */
function tiebreakerTODO(imagename) {
	switch (imagename) {
		// Sumeru: The Rainforest of Lore
		case 'UI_AchievementIcon_A012.png':
			return 53243; // only one in the series
			//return 47031; // if there's another achievement group series

		case 'UI_ChapterIcon_SeaLamp.png':
			return 14106; // new lantern rite event quest icon. https://youtu.be/ZsUNt5zTNBI?t=3102
			// we will need to grab the old one if we want to archive it.
			// and also make sure images are right for future lantern rite events.

		// Box of crystal fragments. In case they add new element fragments in the future?
		case 'UI_ItemIcon_115013':
			return 70360;
		case 'UI_ItemIcon_115021':
			return 98568;
		case 'UI_ItemIcon_115034':
			return 82161;


	}
	return undefined;
}




module.exports = function(imagename) {
	let correctsize = tiebreakerTODO(imagename);
	if (correctsize !== undefined) return correctsize;

	switch (imagename) {
		case 'UI_AchievementIcon_B001.png':
			return 52371;
		case 'UI_AvatarIcon_Ambor.png': // uncensored
			return 70612;
		case 'UI_AvatarIcon_Ambor_Card.png': // uncensored
			return 65175;
		case 'UI_AvatarIcon_DilucCostumeFlamme.png':
			return 85344;
		case 'UI_AvatarIcon_DilucCostumeFlamme_Card.png':
			return 82617;
		case 'UI_AvatarIcon_FischlCostumeHighness.png':
			return 79941;
		case 'UI_AvatarIcon_FischlCostumeHighness_Card.png':
			return 85595;
		case 'UI_AvatarIcon_Mona.png': // uncensored
			return 113211;
		case 'UI_AvatarIcon_Mona_Card.png': // uncensored
			return 79166;
		case 'UI_AvatarIcon_Qin.png': // uncensored
			return 69428;
		case 'UI_AvatarIcon_QinCostumeSea.png':
			return 70732;
		case 'UI_AvatarIcon_Qin_Card.png': // uncensored
			return 62598;
		case 'UI_AvatarIcon_Rosaria.png': // uncensored
			return 84974;
		case 'UI_AvatarIcon_Rosaria_Card.png': // uncensored
			return 67603;
		case 'UI_AvatarIcon_Side_Ambor.png':
			return 13612;
		case 'UI_AvatarIcon_Side_Mona.png': // honestly not much difference
			return 22682;
		case 'UI_AvatarIcon_Side_Qin.png':
			return 15645;
		case 'UI_AvatarIcon_Side_Rosaria.png':
			return 14921;
		case 'UI_Codex_Scenery_LYkuangchang.png':
			return 68048;
		case 'UI_Codex_Scenery_XMDiXiaDongXue.png':
			return 50798;
		case 'UI_CoopImg_Bennett.png': // no clue what this is
			return 883192;
		case 'UI_CoopImg_Chongyun.png': // no clue what this is
			return 1038882;
		case 'UI_Costume_DilucCostumeFlamme.png':
			return 1600869;
		case 'UI_Gacha_A022_Up1': // uncensored mona
			return 867424;
		case 'UI_Gacha_A079_Up2': // uncensored rosaria
			return 292949;
		case 'UI_Gacha_A112_Up2': // uncensored rosaria
			return 311880;
		case 'UI_Gacha_A113_Up2': // uncensored rosaria
			return 312211;
		case 'UI_Gacha_AvatarIcon_Ambor': // uncensored
			return 387434;
		case 'UI_Gacha_AvatarIcon_Dori': // ???
			return 498545;
		case 'UI_Gacha_AvatarIcon_Mona': // uncensored
			return 562896;
		case 'UI_Gacha_AvatarIcon_Qin': // uncensored
			return 464431;
		case 'UI_Gacha_AvatarIcon_Rosaria': // uncensored
			return 535103;
		case 'UI_Gacha_AvatarImg_Ambor': // uncensored
			return 685331;
		case 'UI_Gacha_AvatarImg_Dori': // ???
			return 901802;
		case 'UI_Gacha_AvatarImg_Mona': // uncensored
			return 1993322;
		case 'UI_Gacha_AvatarImg_Qin': // uncensored
			return 1132556;
		case 'UI_Gacha_AvatarImg_Rosaria': // uncensored
			return 834213;
		case 'UI_Gcg_CardFace_Char_Avatar_Qin':
			return 64347;
		case 'UI_Gcg_CardFace_Char_Avatar_Qin_Golden':
			return 66438;
		case 'UI_Gcg_CardFace_Char_Monster_Fatuus':
			return 62849;
		case 'UI_Gcg_CardFace_Char_Monster_Fatuus_Golden':
			return 65925;
		case 'UI_Homeworld_Exterior_Xm_Build_Juyuan_01_Lod0':
			return 77664;
		case 'UI_Home_Suite_Interior_Dq_Room_of_Ground':
			return 351729;
		case 'UI_Home_Suite_Interior_Dq_Room_of_Study':
			return 319985;
		case 'UI_Home_Suite_Interior_Dq_Room_of_Teahouse':
			return 328022;
		case 'UI_InazumaTutorial_TeleportHighway':
			return 288093;
		case 'UI_ItemIcon_101111': // sumeru billet
			return 30681;
		case 'UI_ItemIcon_101112': // sumeru billet
			return 33816;
		case 'UI_ItemIcon_101113': // sumeru billet
			return 31769;
		case 'UI_ItemIcon_101114': // sumeru billet
			return 51114;
		case 'UI_ItemIcon_101115': // sumeru billet
			return 28234;
		case 'UI_ItemIcon_101202': // sakura bloom
			return 41578;

		case 'UI_LegendQuestImg_Ambor': // censored
			return 299377;
		case 'UI_LegendQuestImg_Mona': // censored
			return 307776;
		case 'UI_LegendQuestImg_Qin': // censored
			return 280368;

		case 'UI_Mall_BannerSD_02': // diluc outfit
			return 1113057;
			



	}

	
}