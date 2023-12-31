export type equipmentTypes = "Range" | "Support" | "Melee";
export type activeTimeType = "ROUND" | "CYCLE" | "TURN" | "FIRST";

export enum EDefaultEquipmentID {
  PISTOL = 1,
  REVOLVER = 2,
  SMITH_AND_WESSON_MODEL = 3,
  M1911 = 4,
  SHOTGUN = 5,
  SAWED_OFF_SHOTGUN = 6,
  MOLOTOV_COCKTAIL = 7,
  MACHINE_GUN = 8,
  BEER = 9,
  COCKTAIL = 10,
  LEATHER_HANDBAG = 11,
  BLACK_AND_GOLD_CANE = 12,
  BLACK_AND_SILVER_CANE = 13,
  BROWN_AND_SILVER_CANE = 14,
  BROWN_AND_GOLD_CANE = 15,
  KNIFE = 16,
}

export enum ENormalEquipmentID {
  DAGGER = 1,
  BATON = 2,
  FRYING_PAN = 3,
  AXE = 4,
  HAMMER = 5,
  MACHETE = 6,
  KATANA = 7,
  HAND_GUN = 8,
  RIFLE = 9,
  CARBINE = 10,
  TOMMY_GUN = 11,
  REMMINGTON_870 = 12,
  GRENADE = 13,
  PR_FLAME_BOTTLES = 14,
}

export const THROWABLE_IDS = [ENormalEquipmentID.PR_FLAME_BOTTLES, ENormalEquipmentID.GRENADE, EDefaultEquipmentID.MOLOTOV_COCKTAIL];

export const CSupportEquipments: Record<number, { name: string; cooldown: number; cooldownType: activeTimeType }> = {
  [EDefaultEquipmentID.BEER]: {
    name: "Beer",
    cooldown: 3,
    cooldownType: "TURN",
  },
  [EDefaultEquipmentID.LEATHER_HANDBAG]: {
    name: "Pistol",
    cooldown: 3,
    cooldownType: "TURN",
  },
};

export const CDefaultWeaponsName: Record<
  EDefaultEquipmentID,
  {
    name: string;
    key: string;
    isThrowable: boolean;
    type: equipmentTypes;
  }
> = {
  [EDefaultEquipmentID.BEER]: {
    name: "Beer",
    isThrowable: false,
    key: "BEER",
    type: "Support", //!
  },
  [EDefaultEquipmentID.BLACK_AND_GOLD_CANE]: {
    name: "Black and Gold Cane",
    isThrowable: false,
    key: "BLACK_AND_GOLD_CANE",
    type: "Melee",
  },
  [EDefaultEquipmentID.BLACK_AND_SILVER_CANE]: {
    name: "Black and Sliver Cane",
    isThrowable: false,
    key: "BLACK_AND_SILVER_CANE",
    type: "Melee",
  },
  [EDefaultEquipmentID.BROWN_AND_GOLD_CANE]: {
    name: "Brown and Gold Cane",
    isThrowable: false,
    key: "BROWN_AND_GOLD_CANE",
    type: "Melee",
  },
  [EDefaultEquipmentID.BROWN_AND_SILVER_CANE]: {
    isThrowable: false,
    name: "Brown and Slive Cane",
    key: "BROWN_AND_SILVER_CANE",
    type: "Melee",
  },
  [EDefaultEquipmentID.COCKTAIL]: {
    name: "Cocktail",
    key: "COCKTAIL",
    isThrowable: false,
    type: "Melee",
  },
  [EDefaultEquipmentID.KNIFE]: {
    name: "Knife",
    isThrowable: false,
    key: "KNIFE",
    type: "Melee",
  },
  [EDefaultEquipmentID.LEATHER_HANDBAG]: {
    name: "Leather Handbag",
    isThrowable: false,
    key: "LEATHER_HANDBAG",
    type: "Melee", // !
  },
  [EDefaultEquipmentID.M1911]: {
    name: "M1911",
    isThrowable: false,
    key: "M1911",
    type: "Range",
  },
  [EDefaultEquipmentID.MACHINE_GUN]: {
    name: "Machine Gun",
    key: "MACHINE_GUN",
    isThrowable: false,
    type: "Range",
  },
  [EDefaultEquipmentID.MOLOTOV_COCKTAIL]: {
    name: "Molotov Cocktail",
    key: "MOLOTOV_COCKTAIL",
    type: "Range",
    isThrowable: true,
  },
  [EDefaultEquipmentID.PISTOL]: {
    name: "Pistol",
    key: "PISTOL",
    isThrowable: false,
    type: "Range",
  },
  [EDefaultEquipmentID.REVOLVER]: {
    name: "Revolver",
    isThrowable: false,
    key: "REVOLVER",
    type: "Range",
  },
  [EDefaultEquipmentID.SAWED_OFF_SHOTGUN]: {
    name: "Sawed-Off Shotgun",
    key: "SAWED_OFF_SHOTGUN",
    isThrowable: false,
    type: "Range",
  },
  [EDefaultEquipmentID.SHOTGUN]: {
    name: "Shotgun",
    isThrowable: false,
    key: "SHOTGUN",
    type: "Range",
  },
  [EDefaultEquipmentID.SMITH_AND_WESSON_MODEL]: {
    name: "Smith and Wesson Model",
    isThrowable: false,
    key: "SMITH_AND_WESSON_MODEL",
    type: "Range",
  },
};

export const CNormalWeaponsName: Record<
  ENormalEquipmentID,
  {
    name: string;
    isThrowable: boolean;
    key: string;
    type: equipmentTypes;
  }
> = {
  [ENormalEquipmentID.AXE]: {
    name: "Axe",
    isThrowable: false,
    key: "AXE",
    type: "Melee",
  },
  [ENormalEquipmentID.BATON]: {
    name: "Baton",
    key: "BATON",
    isThrowable: false,
    type: "Melee",
  },
  [ENormalEquipmentID.CARBINE]: {
    isThrowable: false,
    name: "Carbine",
    key: "CARBINE",
    type: "Range",
  },
  [ENormalEquipmentID.DAGGER]: {
    name: "Dagger",
    key: "DAGGER",
    isThrowable: false,
    type: "Melee",
  },
  [ENormalEquipmentID.FRYING_PAN]: {
    name: "Frying pan",
    isThrowable: false,
    key: "FRYING_PAN",
    type: "Melee",
  },
  [ENormalEquipmentID.GRENADE]: {
    name: "Grenade",
    isThrowable: true,
    key: "GRENADE",
    type: "Range",
  },
  [ENormalEquipmentID.HAMMER]: {
    name: "Hammer",
    isThrowable: false,
    key: "HAMMER",
    type: "Melee",
  },
  [ENormalEquipmentID.HAND_GUN]: {
    name: "Hand gun",
    isThrowable: false,
    key: "HAND_GUN",
    type: "Range",
  },
  [ENormalEquipmentID.KATANA]: {
    name: "Katana",
    isThrowable: false,
    key: "KATANA",
    type: "Melee",
  },
  [ENormalEquipmentID.MACHETE]: {
    name: "Machete",
    key: "MACHETE",
    isThrowable: false,
    type: "Melee",
  },
  [ENormalEquipmentID.PR_FLAME_BOTTLES]: {
    name: "PR Flame Bottles",
    isThrowable: true,
    key: "PR_FLAME_BOTTLES",
    type: "Range",
  },
  [ENormalEquipmentID.REMMINGTON_870]: {
    name: "Remminton 870",
    isThrowable: false,
    key: "REMMINGTON_870",
    type: "Range",
  },
  [ENormalEquipmentID.RIFLE]: {
    name: "Rifle",
    key: "RIFLE",
    isThrowable: false,
    type: "Range",
  },
  [ENormalEquipmentID.TOMMY_GUN]: {
    name: "Tommy gun",
    key: "TOMMY_GUN",
    isThrowable: false,
    type: "Range",
  },
};
