# Table of contents

<!--ts-->

- [Gangwars](#gangwars)
  _ [High Level Overview of Gangwars](#high-level-overview-of-gangwars-as-on-other-public-mainstream-chains)
  _ [Scope of Improvement
  ](#scope-of-improvement)
- [Gangwars on Aleo](#gangwars-on-aleo)
_ [Major differences in implemention of Gangwars on Aleo as compared to Aleo on other mainstream public chains](#major-differences-in-implemention-of-gangwars-on-aleo-as-compared-to-aleo-on-other-mainstream-public-chains)
_ [Transitions used
](#transitions-used) \* [Kryha's SDK](#kryhas-sdk)
<!--te-->

# Gangwars

[Gangwars](https://war.gangstaverse.co/) is already a successful online game of battle between two teams with five members each currently live on ICON chain with plans to expand it on BASE in near future. So far, users have spent 24,000+ ICX and 500,000+ CROWN to participate in the games and everyday all the games are fully packed with players.

<details>

<summary> Expand this section to learn how Gangwars currently works on other chains. </summary>

## High Level Overview of Gangwars as on other public mainstream chains

The current version of the game as running on the ICON can be briefly summarized with the following points:

### Game Setup and Registration

First, the game administrator initiates the game on the ICON blockchain and announces the starting time of the battle along with the registration deadline. To participate, players must register with a player character Non-Fungible Token (NFT) on the blockchain. Each NFT encapsulates attributes that determine the player's strength, weapons, hit chance, damage chance, and more. Learn more about these attributes [here](https://gangstaverse.medium.com/gangwars-introducing-primary-and-secondary-stats-e236050f33dc).

> Note: This happens fully on chain.

### Team Formation and Balancing:

Once the registration deadline is reached, a centralized server retrieves the NFTs of the registered players and divides them into two teams, aiming to balance the teams' overall strength. This ensures a fair and competitive gameplay experience.

> Note: This happens off-chain.

### Simulation

#### Battle Modes

The battles are initiated within the centralized server. Various battle modes are available, and one of these modes is randomly selected for each round. These modes include "One vs One," where one player is chosen from each team, and "Two vs One," involving two players from the first team against one player from the second team. The game offers over 20 such battle modes, each offering unique combinations of players and weapons. The full list of available modes can be viewed on the Gangwars platform.

#### Attack Mechanism and Damage Calculation

During battles, attacks are executed based on the chosen mode. To decide if a attack landed on the targeted player, a biased coin is flipped. The probability for landing a attack as well as the damage is based on the stats of both the attacking player and the targeted player.
`P(Successful Hit) = Hit Chance of Attacking Player * (1 - Dodge Chance of Dodged Player)`

#### Medic Kits and Recovery:

Players have the option to employ medic kits to restore their health during battles. This adds an element of strategy as players must decide when to use these resources to maximize their chances of survival.

#### Progression and Rounds:

The game progresses through multiple rounds of battles or face-offs between the two teams. Teams alternate between roles as attackers and targets, creating a dynamic and engaging gameplay loop. The game's frontend displays these events with symbolic representations and narrations that enhance the overall immersive experience.

Learn more about simulation and core mechanics [here](https://gangstaverse.medium.com/gangwars-core-mechanics-4d40dfa9ad17)

> Note: This happens off-chain.

### Victory Conditions and Rewards:

The game concludes when all players from one of the teams have been defeated. The winning team is declared, and this information is updated on the blockchain. The event logs are pushed to Arweave. Players from the victorious team are rewarded with on-chain assets, adding an incentive for strategic gameplay and teamwork. These assets can be used to further enhance NFT's stats.

</details>

### Scope of Improvement

The game on ICON is well appreciated by the community, yet we see some scope of improvement:

- Everything is fine upto the user registration phase. But when it comes to team division we try to balance team such that total strength of each team is comparable. This task is handled by a central server and is not verified. The impact of creating a biased team could lead to predictable win to the team favored by the server.
- Another important part which could be done any better is using **verifiable randomness** i.e. proving spectators that we are making moves based on randomness for choosing the mode of battle and the players in each round.

In short, we need a way to validate our offchain actions which could have significant impact on end outcomes.

# Gangwars on Aleo

With Aleo we are trying to implement a verifiable version of Gangwars. Before we begin with actual flow of how our game is made verifiable by using Aleo it is recommended to get familiarized with Aleo Blockchain, Zero Knowledge Proof and Zero Knowledge Succicnt Non-Interactive Arguments of Knowledge \(zk-snarks\).

## Randomness

Critical part of game engine is the use of randomness. Randomness is used in each round to :

- select a attacking (main) player and targeted player
- determine if the targeted player dodged the attack
- determine if the attack actually landed
- determine if the landed attack was critical

In our game,

- In each transition where we make moves randomly we need to use the random number available on Aleo chain.
- For the first time random number is seeded by `start_game` transition.
- After that while making every transition call the random number should be supplied along with other necessary parameters.
- The transition will make use of random number to decide any actions which requires verifiable randomness. Please refer to game_loop transition for better insight.
- When all the necessary computations of attacks are done we regenerate a random number by xoring the current Aleo's random number given by `ChaCha::rand_u16()` with the previous one and update it on chain.
- This loop continues until game end.

Generic Flow diagram of this process is as shown in the image below:

![Sequence Diagram of Game Creation ](https://drive.google.com/uc?id=1pMJN-HOJua8MeCeeLfm6M1YZrP4y-1ZW)
[View image in Draw.io](https://drive.google.com/file/d/1UNgYdlVOPSd29BLWDDHIMWjPppl4Bt9r/view?usp=sharing)

> Note: we are supplying random number, which is stored in previous transition call, in each transition call. It is mainly because we have used `ChaCha::rand_u16()` in finalize block which gives us current random number from Aleo chain which changes depending upon transactions and block formation. For proving our random move we cannot rely on live onchain random value which changes frequently. Instead we use the one that we have saved in a transition call and generate proof of using it and update it with **current random number xored with previous one** for next transition call. And so on.

> #### How do we prove random moves in Gangwars on Aleo?

### Major differences in implemention of Gangwars on Aleo as compared to Aleo on other mainstream public chains

- The most important difference is the random moves being verifiable. Players no more need to trust our central server for an honest gameplay.
- For this specfic phase of submission
  - Gangwars with 3 players in each team with the plan of expanding it to 5 vs 5.
  - Also there will only be one mode \(1 vs 1 mode\) of attack instead of 20+ modes.

## Transitions

Our overall game can be covered by 6 major transitions which can also be viewed as different phases of game:

### 1. Game Creation

Game is created with create_game transition.

```rust
transition create_game(
  simulation_id: u32,
  registration_time: u32,
  max_number_of_players: u8,
  max_rounds: u8,
  participation_lootcrate_count: u8,
  winner_lootcrate_count: u8
)
```

<details>
<summary> Inputs </summary>

#### Inputs

- **simulation_id**: A unique identifier for a particular game. No two game can have the same id.
- **registration_time**: Duration (in blocks) to which players can join the game. It is added with `block.height` to get `deadline_to_register`.
- **max_number_of_players**: Max number of players that can join the particular war. For our case it is always 6.
- **max_rounds** (Max allowed faceoffs) Max times the simulation will be run for this game.
- participation_lootcrate_count: `Lootcrate NFT` to be received upon participation
- **winner_lootcrate_count**: Additional `Lootcrate NFT` to be recieved upon win.
</details>

<details>
<summary> Outputs </summary>

#### Ouputs

The transition does not have any outputs.

</details>

<details>
<summary> Finalize </summary>

#### Finalize

```rust
finalize create_game(
  simulation_id: u32,
  registration_time: u32,
  max_number_of_players: u8,
  max_rounds: u8,
  participation_lootcrate_count: u8,
  winner_lootcrate_count: u8
)
```

The input parameters to the finalize statement is stored on chain in a mapping with `simulation_id` as key into the `GangwarSettings` struct as value.

```rust
struct GangwarSettings {
  created_at: u32,
  deadline_to_register: u32,
  max_number_of_players: u8,
  max_rounds: u8,
  participation_lootcrate_count: u8,
  winner_lootcrate_count: u8,
  registered_players: u8,
  random_number: u16
}
```

- **created_at**: `block.height`
- **deadline_to_register**: `block.height` + `registration_time`
- **max_number_of_players**: Max number of players that can join the particular war. For our case it is always 6.
- **max_rounds** (Max allowed faceoffs) Max times the simulation will be run for this game.
- **participation_lootcrate_count**: `Lootcrate NFT` to be received upon participation.
- **winner_lootcrate_count**: Additional `Lootcrate NFT` to be recieved upon win.
- **registered_players**: Number of players who have joined this gangwar. Initially set to 0.
- **random_number**: `ChaCha::rand_u16()`

</details>

<details>
<summary> Sequence diagram </summary>

#### Sequence Diagram

![Sequence Diagram of Game Creation](https://drive.google.com/uc?id=1BMkJJbViWwZK1ZWlO5PBGTvb7M-n0zjM)

[View image in Draw.io](https://drive.google.com/file/d/1UNgYdlVOPSd29BLWDDHIMWjPppl4Bt9r/view?usp=sharing)

</details>

> This transition can only be called by the admin

### 2. Player Registration / Game Joining

Once a game is created, players may now join the game before pre-specified deadline.

```rust
transition join_game(
  simulation_id: u32,
  char: Character,
  signature: Signature
) -> Player
```

<details>
<summary> Inputs </summary>

#### Inputs

- **simulation_id**: A unique identifier for a particular game.
- **char**: A Character struct
- **signature**: Signature of admin

Character is a struct that defines the attributes of the player. Each character has `PrimaryStats`, `SecondaryStats` and a `Weapon`. These attributes are responsible for the outcome in a battle.

```rust
struct Character {
    nft_id: u16,
    player_addr: address,
    primary_stats: PrimaryStats,
    secondary_stats: SecondaryStats,
    primary_equipment: Weapon,
}
```

> A valid signature of the admin is required to join the game.

> To check the signature of the admin, we required something similar to `ecrecover` on Aleo. Since we couldn't find something similar, we instead implemented Schnorr Signature Algorithm in Leo.

Players have the opportunity to choose their player character from a collection of characters available. These characters are based on actual NFTs on ICON Blockchain. To initiate this process, players make a selection request to our centralized server, which holds authorization to sign the player character. The centralized server responds by providing the `Character` along with its associated attributes and a `Signature`.

After acquiring the `Character` and `Signature`, players can join the game using **Leo Wallet**.

</details>

<details>
<summary> Outputs </summary>
This creates a `Player` record in the ownership of the admin. The `Player` record is defined as:

```rust
record Player {
  owner: address,
  simulation_id: u32,
  char: Character
}
```

</details>

<details>
<summary> Sequence Diagram </summary>

Sequence diagram of this phase is as shown in the image below:
![Sequence Diagram of Game Creation ](https://drive.google.com/uc?id=1uIFQv9X5OsRSDLvBd0Ys3S-tHgH96Lnq)
[View image in Draw.io](https://drive.google.com/file/d/1UNgYdlVOPSd29BLWDDHIMWjPppl4Bt9r/view?usp=sharing)

</details>

### 3. Game Start (Transition)

This is the phase from which we will feel the value of Aleo for creating verifiable gaming engine. After player registration deadline is met our central server fetches the unspent records of players registered for a particular **game Simulation ID** and sorts them in decreasing order of strength.

#### 3.1 Team Division

Having filtered registered players we create two nearly equally powerful teams with the method as mentioned:

```
    1. Lets represent our sorted list of players as: p1,   p2,   p3,   p4,   p5,   p6.
    2. We segregate them in team A and B in ABBA order except for the last two.
        - p1(A),    p2(B),   p3(B),   p4(A)
    3. Now calculate strength of each team
        - Strength_team_a = p1.strength + p4.strength
        - Strength_team_b = p2.strength + p3.strength
    4. If Strength_team_a > Strength_team_b
            Include 6th player in team A and the 5th in team B
        else
            Include 5th player in team A and the 6th in team B
```

We do above computation offchain yet verify it onchain using **zero knowledge proof** of it.

#### 3.2 War Record Creation

War record is a structure used to maintain onchain state of the gangwars game with following declaration:

```
record War {
     owner: address,
     simulation_id: u32,
     round: u8,  // Which round of attack is the current one.
     main_team: Team,  // It's the team which will attack in this round.
     target_team: Team,  // It's the team which will be attacked in this round.
     physical_attack: PhysicalAttack  // It's a struct which holds the information of every action that happened in this round.
     // physical_attack is easily understandable in the example of War record instance.
 }
```

Lets see an instance of a War record with explanation of each variable used:

```
{
 "warRecord": {
     "owner": "aleo1rhgdu77hgyqd3xjj8ucu3jj9r2krwz6mnzyd80gncr5fxcwlh5rsvzp9px",
     "simulationId": 1,
     "round": 0,
     "mainTeam": {	// Each team consists of three players p1, p2 & p3.
         "p1": {	// First player from main team
             "nftId": 1857,	// ID corresponding to NFT on ICON chain.
             "playerAddr": "aleo1rhgdu77hgyqd3xjj8ucu3jj9r2krwz6mnzyd80gncr5fxcwlh5rsvzp9px",
             "primaryStats": {
                 "strength": 242
             },
             "secondaryStats": {
                 "health": 1213,
                 "dodgeChance": 0.3909971770809491,    // It is the probability that this player will dodge when attacked.
                 "hitChance": 0.037705043106736856,	  // It is the probability that this player will get hit when attacked.
                 "criticalChance": 0.4370031280994888, // It is the probability that this player will get critical i.e. health deteriorates 2x when attacked.
                 "meleeDamage": 0.5150072480354009     // It is the damage factor used to calculate the damage that his/her melee can have on others while attacking.
             },
             "primaryEquipment": {   // This is the equipment which comes by default with the NFT character.
                 "id": 10,
                 "type": 2,               // We have three kinds of equipment "Range", "Support", "Melee"
                 "consumptionRate": 20,   // Rate by which the equipment comsumes ammo.
                 "criticalChance": 0.035996032654306856, // Chance of making target critical
                 "duraAmmo": 136,    // Max. Number of attacks the weapon can be used for. For default it's infinitely large number.
                 "damage": 192,      // Damage to target i.e. how much health is decucted
                 "hitChance": 0.33800259403372246,   // Chace of hitting target
                 "numberOfHits": 2,                  // Currently unused
                 "isBroken": false                   // Wheter or not the weapon is broken.
             }
         },
         "p2": {// Similar struct as that of p1 will exist with different ids, stats and equipments
         },
         "p3": {// Similar struct as that of p1 will exist with different ids, stats and equipments
         }
     },
     "targetTeam": {// Just like Main team, here we will have struct for the target team with 3 different players
     },
     "physicalAttack": {     // This is the struct that holds the snapshopt of events that actually happened for this single round.
         "isDodged": true,   // Whether or not the player from target team dodged.
         "isHit": false,     // Target may be hit only if he did not dodge,
         // Simplified logic to understand how isHit is determined is as followed.
         // if (isDodged){
         //  isHit = False
         // }
         // else {           // if target did not dodge then only we check if he gets hit by using target's hit chance.
         //  if( findIfHit(hit_chance_of_target_player, random_number) ){
         //  isHit = true;
         // }
         // }

         "isCritical": false,    // Wheter or not the target is critical.
         "totalCriticalHits": 0, // Total critical hits on target.
         "totalNormalHits": 0,   // Total Normal hits on target.
         "totalHits": 0,         // totalCriticalHits + totalNormalHits
         "damage": 0             // Damage to target
     },
     "_nonce": "5534833066209720883638107450814171444187239793496702055322327037254406892437"
   }
 }
```

Sequence diagram of this phase is as shown in the image below:
![Sequence Diagram of Game Creation ](https://drive.google.com/uc?id=10LDWXKCX9c7cu10sLclCMMexUkbMGXfW)
[View image in Draw.io](https://drive.google.com/file/d/1UNgYdlVOPSd29BLWDDHIMWjPppl4Bt9r/view?usp=sharing)

### 4. Game Loop \(Transition\)

This is the phase that actually comsumes a war record, makes all the moves randomly, submits proof to the chain and return an updated war record for next round. The transition takes two input parameter: war record and a random number, and returns war record by calling finalize block which updates the new random number for next round. Game loop transition can be understood by the following skeleton definition:

```
transition game_loop(w: War, random_seed: u16) -> War {
    // Choose players from both teams to faceoff based on random_seed
    // Calculate damage
    // Create new war record with updated player stats in each team, and also swap the main_team and target_team for next round
    // Return new war record
    // Finalize game_loop

}
finalize game_loop(initial_random_seed: u128, new_random_seed: u128) {
   let saved_random_seed: u128 = Mapping::get_or_use(settings, 0u128, 0u128);  // fetch the random number saved on chain
   assert_eq(initial_random_seed, saved_random_seed);                          // ensure that the new_random_seed being used in this transition is actually the one saved on chain
   let new_random_number: u128 = ChaCha::rand_u128();    // Generage new random number
   Mapping::set(settings, 0u128, new_random_number);     // Save the newly generated random number
}

```

The pseudocode of choosing players to faceoff based on random seed is as follows:

```
 selected_player = random_seed % 3
 if selected_player is alive then return selected_player
 else{        // if randomly selected player is dead then we select next alive player
   loop 2 times{
     selected_player += 1
     if selected_player is alive then return selected_player
   }
 if none could be selected then return a flag indicating the game is over.
 }
```

> In returned war record the main_team and target_team are **swapped** ensuring they attack and defend turn by turn.
> This game loop is called for maximum number of allowed rounds or until one of the whole team is dead.
> Once a war record is consumed it cannot be reused which is handled by the chain itself.

Sequence diagram of this phase is as shown in the image below:
![Sequence Diagram of Game Creation ](https://drive.google.com/uc?id=1aWqFNPi_aQAzFoftXE891Xyf88JHg6RW)
[View image in Draw.io](https://drive.google.com/file/d/1UNgYdlVOPSd29BLWDDHIMWjPppl4Bt9r/view?usp=sharing)

#### Necessity of Array in Leo

We have used bitwise operations over `u8` integer to store flags of alive status of players and also for flags for players who have already been selected in the same round of attack. In Leo language, we were limited with this approach for programmability mainly due to unavailability of **array in Leo**. Even though we do not launch 2 vs 1 or 3 vs 3 in current submission, the following logic is a dynamic way of selecting a player at random among alive and unique players for all modes of gameplay.

```
    inline get_eligible_player_index(alive_players: u8, already_selected_players: u8, random_seed: u16) -> u8 {
      //  For 1 vs 1 mode of gameplay already_selected_players parameter will have no effect logically, since we only need 1 player.
      //  But when it is **2 vs 1** then we do not want the both players from first team to be the same one.
      /// Representation of players is in u8 as LSBs (Least Significant Bits)
      /// For example: 7u8 => 00000111 => Represent all three players
      /// For example: 4u8 => 00000100 => Represents third player

      /// Selects an eligible player based on a random_number
      /// A player is eligible if he is alive and has not been selected previously

      let eligible_player_index: u8 = 8u8; // Starting with an out of range value

      // Select a random index to denote the player
      // Since we have 3 players, mod by 3u8
      let random_player_index: u8 = BHP256::hash_to_u8(random_seed).mod(3u8);

      // Get a random player
      // If random_player_index = 0u8 => random_player = 00000001 (p1)
      // If random_player_index = 1u8 => random_player = 00000010 (p2)
      // If random_player_index = 2u8 => random_player = 00000100 (p3)
      let random_player: u8 = 1u8<<(random_player_index);

      // Ensure the random_player is eligible
      if ((
          (random_player & already_selected_players) == 0u8 ) && // Random player is not selected previously
          ((random_player & alive_players) != 0u8 )) // Random player is alive
          {
              eligible_player_index = random_player_index;
          }
      else { // search for a random player
          for i:u8 in 0u8..2u8{
              random_player = random_player<< 1u8;   // try with next player
              random_player_index += 1u8;
              if (random_player == 8u8) {
                  random_player = 1u8;
                  random_player_index = 0u8;
              }
              if ((random_player & already_selected_players)== 0u8 ) && ((random_player & alive_players) != 0u8 ){
                  eligible_player_index = random_player_index;
              }
          }
      }
      return eligible_player_index + 1u8;  // if returned value is 9u8 then we will understand that all players in the team is dead else we will get one player.
  }
```

We faced similar complexity when implementing function call for faceoffs between any player from each team. For eg. in 1 vs 1 mode we have to select 1 player from each team at random. So there will be 9 combination of if ... else if ... statements. If there was provision of array then this could be done without any if statement by directly selecting players with array indexing.

```
rand_player_team_a = get_eligible_player_index( team_a, ... );  // returns a random player from team a
rand_player_team_b = get_eligible_player_index( team_b, ... );  // returns a random player from team b

if ( rand_player_team_a == 1u8 && rand_player_team_b == 1u8){

  par = physical_attack_sequence(w.main_team.p1, w.target_team.p1, new_random_seed);
        // w is war record, this function executes the mathematics and logics of attack and is one of the core function.
}
if ( rand_player_team_a == 1u8 && rand_player_team_b == 2u8){
  par = physical_attack_sequence(w.main_team.p1, w.target_team.p2, new_random_seed);
}
...
...
if ( rand_player_team_a == 3u8 && rand_player_team_b == 3u8){
  par = physical_attack_sequence(w.main_team.p3, w.target_team.p3, new_random_seed);
}
```

If there was provision for array then above code could be implemented by:

```
rand_player_team_a = get_eligible_player_index( team_a, ... );  // returns a random player from team a
rand_player_team_b = get_eligible_player_index( team_b, ... );  // returns a random player from team b

par = physical_attack_sequence(w.main_team.p[rand_player_team_a - 1u8], w.target_team.p[rand_player_team_b-1u8], new_random_seed);
```

The LOC doubles when we implement **2 vs 1**, since we have to write code as previously for allowing a player to attack from main team to a player from target team, and also we have to allow another player from main team at random except the already selected one to attack the same player from target team. It **triples** when we have to implement **3 vs 3**, and so on.

> We understand the complexity Aleo team has to face to achieve this feature in zk circuits. But it would be a really nice feature to have in a high level programming language.

### 5. Game End \(Transition\)

This is a simple transition which will be called when any of the following conditions meet:

- All the players from any of the team are dead.
- Maximum allowed rounds have been played.

Winner team is announced in this phase. All team members from the winning team are considered winners and are eligible for rewards provided by game.

### 6. Reward distribution

We collect player's Leo address, while they submit the character during game joining phase, with the purpose of reward distribution. We will provide users with a NFT_mint record which they can spend later on to mint NFT on their ownership even in mainnet. For the purpose of NFT distribution we have used the program created by [Artfactory](https://art.privacypride.com/program-walkthrough/v4). The structure of NFT_mint and NFT records are:

```
  record NFT {
      private owner: address,  // Address of player
      private data: TokenId,   // NFT token ID
      private edition: scalar, // which edition of the nft this particular one is -- will be 0 for unique NFTs
  }

  record NFT_mint {
      private owner: address,  // Address of player
      private amount: u8,      // Number of NFT that can be minted by spending this record
  }
```

To get detailed technical overview of this NFT program please visit Artfactory's [official site](https://art.privacypride.com/program-walkthrough/v4).

# Kryha's SDK

A huge round of applause to the Kryha team for open sourcing their SDK which was extremely helpful to integrate Aleo to the outward facing APIs to communicate with frontend and our other servers, type casting the request received through API into Aleo compatible data type and vice versa. At this initial phase of active development of Aleo finding such a useful resource has been really valuable and we have utilized it to the fullest.

> The following section has been written by the Kryha team and can be used to execute this project.

# ZK Gaming SDK

Game development API that allows interaction with the Aleo Zero-Knowledge platform.

Check [Boloney!](https://github.com/Kryha/boloney) the first game built with ZK Gaming Toolkit.

## Getting Started

There are 2 main ways to run the API: locally or inside an isolated Minikube container.

### Running locally

Before running the API locally, make sure to install the following software:

- [Node.js](https://nodejs.org/en) version 18.16.0 LTS
- [Yarn](https://yarnpkg.com/getting-started/install)
- [Aleo](https://github.com/AleoHQ/aleo#2-build-guide)
- [Leo](https://github.com/AleoHQ/leo#2-build-guide)
- [SnarkOS](https://github.com/AleoHQ/snarkOS#22-installation)
- Aleo development server - run `cargo install aleo-development-server`

Run a local SnarkOS beacon node:

```sh
snarkos start --nodisplay --dev 0 --beacon "APrivateKey1zkp8CZNn3yeCseEtxuVPbDCwSyhGW6yZKUYKfgXmcpoGPWH"
```

> ⚠️ Do not change the private key, since the app is configured to use that in develop.

Open another terminal window and run Aleo development server:

```sh
aleo-develop start -p http://127.0.0.1:3030
```

> ⚠️ Make sure to specify that local address. If no address is specified, the dev server will connect to the public testnet and you usually don't want that when developing.

Build all the programs locally by running:

```bash
./build_local_programs.sh
```

The first time you run the API, make sure to deploy the programs as well:

```sh
DEPLOY_PROGRAMS=true DEPLOY_PRIVATE_KEY=APrivateKey1zkp8CZNn3yeCseEtxuVPbDCwSyhGW6yZKUYKfgXmcpoGPWH yarn start
```

Pay very close attention to the application and development server logs.

After all the programs have been deployed to the network, the API should be accessible at <http://localhost:5001>

Unless you reset the network, you don't need to re-deploy the programs, so the following time you want to run the API locally, just run:

```bash
yarn start
```

If you wish to reset your network, stop the beacon process and then run:

```sh
snarkos clean --dev 0
```

> ⚠️ After you reset the local network, you will have to re-deploy your programs.

### Running with Minikube

> ⚠️ It is highly discouraged to use this method unless you are working on deployment or you know what you are doing. When you are running the API through minikube, the app will connect to the public testnet and that is not ideal for development.

Before running the API with Minikube, make sure to install the following software:

- [Docker](https://docs.docker.com/engine/install/)
- [kubectl](https://kubernetes.io/docs/tasks/tools/#kubectl)
- [Minikube](https://minikube.sigs.k8s.io/docs/start/) - perform only the first step, titled "Installation"
- [Skaffold](https://skaffold.dev/docs/install/)

Before running Minikube, make sure Docker is running. If you are on MacOS, make sure to give Docker access to at least 8GB of memory and at least 50GB of virtual disk. You can do that by opening Docker desktop -> settings (in the top right corner) -> resources.

Run Minikube:

```bash
minikube start --cpus=max --memory=max
```

Enable ingress add-on:

```bash
minikube addons enable ingress
```

Open a new terminal tab and run:

```bash
sudo minikube tunnel
```

This will allow you to access the deployed application at the address specified in the ingress configuration so keep it running in the background.

Return to the first terminal tab and run:

```bash
skaffold run
```

This will build the API and deploy it on the minikube cluster.

To check the status of your pods, run:

```bash
kubectl -n zk-gaming-tk-local get pods
```

To read the logs, run:

```bash
# pod_name can be retrieved from the output of the previous command
kubectl -n zk-gaming-tk-local logs <pod_name> -f
```

If the pods are running correctly, the API should be accessible at <http://zk-gaming-tk.localhost>

> ⚠️ On MacOS you may need to configure `dnsmasq` in order to access custom domain names. Consider following this [guide](https://www.stevenrombauts.be/2018/01/use-dnsmasq-instead-of-etc-hosts/#2-only-send-test-and-box-queries-to-dnsmasq) and use `.localhost` instead of `.test` and `.box`.

## Submitting a PR

> ⚠️ These steps can only be completed by maintainers that have access to the wallet.

If a PR contains any changes to the Leo programs, make sure to perform the following actions before completing it so that the programs are correctly deployed to the testnet:

1. Navigate [here](https://demo.leo.app/faucet) and give some credits to the Kryha Aleo account.
2. Wait for the transaction to complete. Don't close the browser tab!
3. Complete the PR and the pipeline should automatically deploy the new programs to the testnet using the newly obtained credits. Just be patient... Like, [very patient](https://youtu.be/xNjyG8S4_kI)... Deployment through the pipeline takes about 8 minutes per program.

## Adding a new Leo program

When creating a new Leo program, the pipeline has to be updated in order for the program to be deployed to the testnet.

Let's assume the name of our program is `cool_program`. For it to be properly deployed, open `azure-pipelines.yaml` and add the following case to the `run_check_script` job:

```sh
files=$(git diff HEAD HEAD~ --name-only)

while IFS= read -r name; do
    # previous cases are omitted here
    ...
    elif [[ $name =~ ^contracts/cool_program/* ]]; then
        echo "##vso[task.setvariable variable=coolProgramUpdated;isoutput=true]True"
    fi
done <<<"$files"
```

Then, in `build_and_deploy_leo_programs_stage` define a new variable:

```yaml
variables:
    # previous variables omitted
    ...
    coolProgramUpdated: $[stageDependencies.check_updated_programs.run_check_script.outputs['UpdatedPrograms.coolProgramUpdated']]
```

In `build_and_deploy_leo_programs_job` job, after all the previously defined steps, add these new steps:

```yaml
- script: |
    docker build -f Dockerfile.program . \
      --build-arg APP_NAME=cool_program \
      --build-arg PRIVATE_KEY=$(privateKey) \
      --build-arg BUILD_ID=$(buildId) \
      --build-arg FEE=600000 \
      --build-arg ZK_GAMING_ALEO="eu.gcr.io/web3-335312/aleo/zk-gaming-snarkos:latest"
  displayName: Cool Program Docker build
  condition: and(succeeded(), eq(variables['coolProgramUpdated'], 'True'))
  retryCountOnTaskFailure: 3
- script: echo "##vso[task.setvariable variable=coolProgramVersion;isoutput=true]$(buildId)"
  displayName: Update Cool Program version locally
  condition: and(succeeded(), eq(variables['coolProgramUpdated'], 'True'))
- script: |
    az pipelines variable-group variable update \
      --group-id $(aleoProgramIdsGroupId) \
      --name coolProgramVersion \
      --org $(devOpsOrg) \
      --project $(devOpsProject) \
      --value $(buildId)
  displayName: Update Cool Program version in variable group
  condition: and(succeeded(), eq(variables['coolProgramUpdated'], 'True'))
  env:
    SYSTEM_ACCESSTOKEN: $(System.AccessToken)
```

The version variable has to be added to the pipeline variable group. For that, contact <marius@kryha.io>.

## Updating Leo and SnarkOS versions

Since both Leo and SnarkOS are currently in active development and some changes may break the build, we manually set the commit hash in `Dockerfile.snarkos` to the latest versions that work properly with the toolkit. If you wish to update to a newer version you should:

1. `git pull` the newest Leo or SnarkOS code and run `cargo install --path .` to install the new versions locally.
2. Make sure the programs build and run correctly with the updated CLI tools.
3. Run the toolkit locally with `yarn start` and make sure the endpoints work as expected.
4. Run `git log` in the Leo or SnarkOS repo and copy the `HEAD` commit hash.
5. Open `Dockerfile.snarkos` and set the proper commit hash to the pasted value.
6. Run the toolkit through `skaffold run` and make sure it works properly.
