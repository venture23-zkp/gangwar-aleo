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

<details>
<summary>Scope of Improvement</summary>

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

![Sequence Diagram of Game Creation ](https://github.com/purusang/gangwar-aleo/blob/main/img/RandomNumber.png#gh-light-mode-only)
![Sequence Diagram of Game Creation ](https://github.com/purusang/gangwar-aleo/blob/main/img/dRandomNumber.png#gh-dark-mode-only)
[View image in Draw.io](https://drive.google.com/file/d/1UNgYdlVOPSd29BLWDDHIMWjPppl4Bt9r/view?usp=sharing)

> Note: we are supplying random number, which is stored in previous transition call, in each transition call. It is mainly because we have used `ChaCha::rand_u16()` in finalize block which gives us current random number from Aleo chain which changes depending upon transactions and block formation. For proving our random move we cannot rely on live onchain random value which changes frequently. Instead we use the one that we have saved in a transition call and generate proof of using it and update it with **current random number xored with previous one** for next transition call. And so on.

> #### How do we prove random moves in Gangwars on Aleo?

### Major differences in implemention of Gangwars on Aleo as compared to Aleo on other mainstream public chains

- The most important difference is the random moves being verifiable. Players no more need to trust our central server for an honest gameplay.
- For this specfic phase of submission
  - Gangwars with 3 players in each team with the plan of expanding it to 5 vs 5.
  - Also there will only be one mode \(1 vs 1 mode\) of attack instead of 20+ modes.

</details>

## Transitions

Our overall game can be covered by 5 major transitions which can also be viewed as different phases of game:

### 1. Game Creation

Game is created with [`create_game`](/contracts/gangwar/src/main.leo#L135-L159) transition.

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

> This transition can only be called by the admin

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

![Sequence Diagram of Game Creation](https://github.com/purusang/gangwar-aleo/blob/main/img/GameCreation.png#gh-light-mode-only)
![Sequence Diagram of Game Creation](https://github.com/purusang/gangwar-aleo/blob/main/img/dGameCreation.png#gh-dark-mode-only)

[View image in Draw.io](https://drive.google.com/file/d/1UNgYdlVOPSd29BLWDDHIMWjPppl4Bt9r/view?usp=sharing)

</details>

### 2. Player Registration

Once a game is created, players may now join the game before pre-specified deadline with [`join_game`](/contracts/gangwar/src/main.leo#L217-L254) transition.

```rust
transition join_game(
  simulation_id: u32,
  char: Character,
  signature: Signature
) -> Player
```

> A valid signature of the admin is required to join the game.

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

> To check the signature of the admin, we required something similar to `ecrecover` on Aleo. Since we couldn't find something similar, we instead implemented [Schnorr Signature Algorithm in Leo](/contracts/dsa/src/main.leo).

Players have the opportunity to choose their player character from a collection of characters available. These characters are based on actual NFTs on ICON Blockchain. To initiate this process, players make a selection request to our centralized server, which holds authorization to sign the player character. The centralized server responds by providing the `Character` along with its associated attributes and a `Signature`.

After acquiring the `Character` and `Signature`, players can join the game using **Leo Wallet**.

</details>

<details>
<summary> Outputs </summary>

#### Output

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
<summary> Finalize</summary>

#### Finalize

On each finalize, a new random_number is saved in the mapping as:
`gangwar_settings[simulation_id].random_number = gangwar_settings[simulation_id].random_number xor ChaCha::rand_u16()`

This ensures that the `random_number` that is used later in simulation is not influenced by the admin.

</details>

<details>
<summary> Sequence Diagram </summary>

#### Sequence Diagram

![Sequence Diagram of Player Registration ](https://github.com/purusang/gangwar-aleo/blob/main/img/GameJoining.png#gh-light-mode-only)
![Sequence Diagram of Player Registration ](https://github.com/purusang/gangwar-aleo/blob/main/img/dGameJoining.png#gh-dark-mode-only)
[View image in Draw.io](https://drive.google.com/file/d/1UNgYdlVOPSd29BLWDDHIMWjPppl4Bt9r/view?usp=sharing)

</details>

### 3. Game Onset

Once all the players have joined, and the deadline to register has passed, game can be started with [`start_game`](/contracts/gangwar/src/main.leo#L259-L346) transition. To start the game, central server fetches the unspent records of players registered to a particular `simulation_id` and creates a `War` record. The players are divided into two teams **fairly** and one of the team is chosen at random to be the attacking team (also called `main_team`).

```rust
transition start_game(
  simulation_id: u32,
  random_seed: u16,
  p1: Player,
  p2: Player,
  p3: Player,
  p4: Player,
  p5: Player,
  p6: Player
) -> War
```

> Player records needs to be sorted by their strength i.e. p1.strength >= p2.strength >= ... >= p6.strength.

<details>
<summary> Inputs </summary>

#### Inputs

- **simulation_id**: A unique identifier for a particular game.
- **random_seed**: Random number for the `simulation_id`. This must be the same value that is stored on the mapping.
- **p1**: Player Record
- **p2**: Player Record
- **p3**: Player Record
- **p4**: Player Record
- **p5**: Player Record
- **p6**: Player Record

> Although, sort could have been implemented within Leo program, we decided to do it outside and simply verify it. It helped us save computation time.

</details>

<details>
<summary> Outputs </summary>
This creates a `War` record in the ownership of the admin. War record is used to maintain onchain state of the gangwars game with following declaration:
The `War` record is implemented as:

```rust
record War {
    owner: address,
    simulation_id: u32,
    round: u8,
    main_team: Team,
    target_team: Team,
    physical_attack: PhysicalAttack
}
```

`Team` is a simple struct that holds the players belonging together. It is implemented as:

```rust
struct Team {
  p1: Character,
  p2: Character,
  p3: Character
}
```

`PhysicalAttack` is used to represent the event that happened for a particular round. It is implemented as:

```rust
struct PhysicalAttack {
    main: u8, // Index of the main (attacking) player
    target: u8, // Index of the targeted player
    is_dodged: bool, // Whether the attack was dodged by targeted player
    is_critical: bool, // Whether the hit by main player was critical.
    total_normal_hits: u16, // Total hits
    total_critical_hits: u16, // Total critical hits. Critical hits cause 2X damage.
    damage: u16 // Actual damage to the targeted player
}
```

</details>

<details>
<summary> Finalize</summary>

#### Finalize

On each finalize, a new random_number is saved in the mapping as:
`gangwar_settings[simulation_id].random_number = gangwar_settings[simulation_id].random_number xor ChaCha::rand_u16()`

This ensures that the `random_number` that is used later in simulation is not influenced by the admin.

</details>

<details>
<summary> Sequence Diagram </summary>

#### Sequence Diagram

![Sequence Diagram of Start Game ](https://github.com/purusang/gangwar-aleo/blob/main/img/StartGame.png#gh-light-mode-only)
![Sequence Diagram of Start Game ](https://github.com/purusang/gangwar-aleo/blob/main/img/dStartGame.png#gh-dark-mode-only)
[View image in Draw.io](https://drive.google.com/file/d/1UNgYdlVOPSd29BLWDDHIMWjPppl4Bt9r/view?usp=sharing)

</details>

### 4. Gameplay Simulation

After the creation of the `War` record, the game enters the simulation phase with [`simulate1vs1`](/contracts/gangwar/src/main.leo#L349-L556) transition. A player is randomly chosen from the `main_team` to initiate an attack on a randomly selected player from the opposing `target_team`.

The determination of whether an attack successfully lands on the targeted player relies on the outcome of a **biased coin flip**. This coin flip is influenced by the respective stats of both the attacking player and the targeted player. The probability of achieving a successful hit is calculated as follow:

`P(Successful Hit) = Hit Chance of Attacking Player * (1 - Dodge Chance of Dodged Player)`

Damage inflicted during the faceoff is calculated based on the number of successful hits achieved. This information tracked and recorded in the `PhysicalAttack` struct within `War` record.

```rust
transition simulate1vs1(
  w: War,
  random_seed: u16
) -> War
```

> The newly created `War` record swaps the `main_team` and `target_team` ensuring they attack and defend turn by turn.

> This transition is called until conditions to end the game is fulfilled.

<details>
<summary> Inputs </summary>

#### Inputs

- **w**: Unspent `War` record. Only 1 unspent `War` record exist for a particular `simualtion_id`.
- **random_seed**: Random number for the `simulation_id`. This must be the same value that is stored on the mapping.

</details>

<details>
<summary> Outputs </summary>

A new `War` record is created at every gameloop.
</details>

<details>
<summary> Finalize</summary>

#### Finalize

On each finalize, we ensure that we are using the saved randomness. Then we updated the saved randomness as:
`gangwar_settings[simulation_id].random_number = gangwar_settings[simulation_id].random_number xor ChaCha::rand_u16()`

</details>

<details>
<summary> Sequence Diagram </summary>

#### Sequence Diagram

![Sequence Diagram of Start Game ](https://github.com/purusang/gangwar-aleo/blob/main/img/GameLoop.png#gh-light-mode-only)
![Sequence Diagram of Start Game ](https://github.com/purusang/gangwar-aleo/blob/main/img/dGameLoop.png#gh-dark-mode-only)
[View image in Draw.io](https://drive.google.com/file/d/1UNgYdlVOPSd29BLWDDHIMWjPppl4Bt9r/view?usp=sharing)

</details>

### 5. Victory and Rewards

Game can be ended to distribute the rewards [\(LootCrate NFT\)](https://gangstaverse.medium.com/the-spoils-of-gangwars-lootcrates-7d32a4ad727d) with [`finish_game`](/contracts/gangwar/src/main.leo#L560-L590) transition when any of the following conditions meet:

- All the players from any of the team are dead.
- Maximum allowed rounds have been played.

```rust
transition finish_game(
  w: War,
  participation_lootcrate_count: u8,
  winner_lootcrate_count: u8,
  random_number: u16
  ) -> (
    lootcrate_nft_v1.leo/NFT_mint,
    lootcrate_nft_v1.leo/NFT_mint,
    lootcrate_nft_v1.leo/NFT_mint,
    lootcrate_nft_v1.leo/NFT_mint,
    lootcrate_nft_v1.leo/NFT_mint,
    lootcrate_nft_v1.leo/NFT_mint
  )
```

<details>
<summary> Inputs </summary>

#### Inputs

- **w**: Unspent `War` record.
- **participation_lootcrate_count**: Number of NFTs to be received upon participation.
- **winner_lootcrate_count**: Number of additional NFTs to be received upon upon.
- **random_seed**: This is used to break a tie.

</details>

<details>
<summary> Outputs </summary>

`NFT_mint` record is minted for all the participants and the winners based on the initial value set in the mapping. The `NFT_mint` record can be later used to claim NFTs once they are added on `lootcrate_nft_v1`. These NFTs will be used to enhance `Character's` in the next version of the game.
</details>

<details>
<summary> Finalize</summary>

#### Finalize

We ensure that the conditions to end the game has actually been met and the rewards has been distributed properly.

</details>

<details>
<summary> Sequence Diagram </summary>

#### Sequence Diagram

![Sequence Diagram of Start Game ](https://github.com/purusang/gangwar-aleo/blob/main/img/FinishGame.png#gh-light-mode-only)
![Sequence Diagram of Start Game ](https://github.com/purusang/gangwar-aleo/blob/main/img/dFinishGame.png#gh-dark-mode-only)
[View image in Draw.io](https://drive.google.com/file/d/1UNgYdlVOPSd29BLWDDHIMWjPppl4Bt9r/view?usp=sharing)
</details>

## Acknowledgements

Thanks to the Kryha team for generously open sourcing their [zk-gaming-toolkit](https://github.com/kryha/zk-gaming-toolkit). This invaluable resource played a pivotal role in seamlessly integrating Aleo with our outward-facing APIs, facilitating communication with our frontend and other servers.