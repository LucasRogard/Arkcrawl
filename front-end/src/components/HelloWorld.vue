<template>
  <div class="m-5">
    <span>Nombre de personnages : </span>
    {{ sortedDatabase.length }}
  </div>
  <input class="m-5" type="text" name="filterName" id="filterName" v-model="filterName">
  <div class="flex justify-center gap-2 m-5">
    <div v-for="n in 6">
      <img v-if="stars >= n" class="w-5" v-on:click="stars = n" src="/star.png" :alt="n.toString()">
      <img v-else class="w-5" v-on:click="stars = n" src="/star_white.png" :alt="n.toString()">
    </div>
  </div>
  <label class="relative inline-flex items-center cursor-pointer mt-10">
    <input type="checkbox" value="" v-model="global" class="sr-only peer">
    <div
      class="group peer ring-0 bg-rose-400  rounded-full outline-none duration-300 after:duration-300 w-24 h-12  shadow-md peer-checked:bg-emerald-500  peer-focus:outline-none  after:content-['✖️']  after:rounded-full after:absolute after:bg-gray-50 after:outline-none after:h-10 after:w-10 after:top-1 after:left-1 after:-rotate-180 after:flex after:justify-center after:items-center peer-checked:after:translate-x-12 peer-checked:after:content-['✔️'] peer-hover:after:scale-95 peer-checked:after:rotate-0">
    </div>
  </label>
  <div class="flex justify-between my-10 ">
    <div v-for="classe of classes" :class="classe.toggle ? 'border-white' : 'border-transparent'"
      class="border-solid  border-4 hover:bg-slate-500 cursor-pointer p-3 rounded-md min-w-74"
      v-on:click="classesChange(classe.classeName)">
      <img class="block m-auto" :src="classe.classImg" :alt="classe.classeName">
      <span>{{ classe.classeName }}</span>
    </div>
  </div>
  <table class="table-fixed w-full border-separate border-spacing-y-5">
    <thead class="sticky z-1">
      <tr>
        <th v-on:click="sortColonne('stars')">
          Etoiles
          <span>{{ arrow('stars') }}</span>
        </th>
        <th>
          Operateur
        </th>
        <th v-on:click="sortColonne('name')">
          Nom
          <span>{{ arrow('name') }}</span>
        </th>
        <th v-on:click="sortColonne('className')">
          Classe
          <span>{{ arrow('className') }}</span>
        </th>
        <th v-on:click="sortColonne('averageRank')">
          Rang moyen
          <span>{{ arrow('averageRank') }}</span>
        </th>
        <th v-for="site of Object.keys(dicos)" v-on:click="sortColonne(`rank${site}`)">
          {{ site }}
          <span>{{ arrow(`rank${site}`) }}</span>
        </th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="character of sortedDatabase" :key="character.name">
        <td class="flex justify-center m-10">
          <img class="w-5" v-for="star in character.stars" src="/star.png" :alt="star.toString()">
        </td>
        <td>
          <img class="block m-auto" :src="character.img" :alt="`icone du personnage ${character.name}`">
        </td>
        <td>
          <a :href="character.link" target="_blank">
            {{ character.name }}
          </a>
        </td>
        <td>
          <img class="block m-auto" :src="character.classImg" :alt="`icone de la classe ${character.className}`">
          {{ character.className }}
        </td>
        <td>
          {{ character.averageRank }}
        </td>
        <td v-for="site of Object.keys(dicos)">
          {{ character[`rank${site}`] }}
        </td>
      </tr>
    </tbody>
  </table>
</template>


<style>
th {
  min-width: 7rem;
}
</style>

<script setup lang="ts">
import { computed, ref } from 'vue'
import characters from '../../../playwright/characters.json'
import dexerto from '../../../playwright/dexerto.json'
import gamepress from '../../../playwright/gamepress.json'
import pocketgamer from '../../../playwright/pocketgamer.json'
import pockettactics from '../../../playwright/pockettactics.json'
import kamigame from '../../../playwright/kamigame.json'


const classesSet = new Set()

for (const character in characters) {
  classesSet.add(JSON.stringify({ classeName: characters[character].className, classImg: characters[character].classImg, toggle: true }))
}

const classes = ref([])

for (const classe of classesSet) {
  classes.value.push(JSON.parse(classe))
}

const stars = ref(6)


const dicos = {
  dexerto,
  gamepress,
  pocketgamer,
  pockettactics,
  kamigame
}

const ranks = ref({
  "E": 1,
  "D": 2,
  "C": 3,
  "B": 4,
  "A": 5,
  "S": 6,
  "SS": 7,
  "EX": 7
})

const global = ref(false)
const filterName = ref('')
const sortBy = ref('name' as 'name' | 'className' | 'averageRank' | 'stars')
const orderBy = ref(1)


function classesChange(classeName: string) {
  if (classes.value.every(classe => classe.toggle === true)) {
    classes.value = classes.value.map(classe => ({
      ...classe,
      toggle: classe.classeName === classeName
    }));
  } else {
    classes.value = classes.value.map(classe =>
      classe.classeName === classeName
        ? { ...classe, toggle: !classe.toggle }
        : classe
    );
    if (classes.value.every(classe => classe.toggle === false)) {
      classes.value = classes.value.map(classe => ({
        ...classe,
        toggle: true
      }));
    }
  }

  console.log(classes.value);
}



console.log


function arrow(colonneName: typeof sortBy.value) {
  if (sortBy.value === colonneName) {
    return orderBy.value === 1 ? '↑' : '↓';
  }
  return '';
}

const ranksByNumber = computed(() => {
  const entries = Object.entries(ranks.value).map(([letter, number]) => [number, letter]);
  return Object.fromEntries(entries)
})

function formatRank(rank: string) {
  return rank.replace(/[\+\-]/g, "") as keyof typeof ranks.value;
}

const database = ref(characters.map((c) => {
  let tmp = { ...c, averageRank: "N/A", averageScore: 0 }
  let average = 0
  let count = 0
  for (const dico in dicos) {
    const rank = dicos[dico as keyof typeof dicos].find((element) => (element.character === c.name) || (element.character === c.japaneseName))?.rank || "N/A"
    if (rank != "N/A") {
      if (ranks.value[formatRank(rank)] && (!global || dico != "kamigame")) {
        count++
        average += ranks.value[formatRank(rank)]
      }
    }
    tmp = { ...tmp, [`rank${dico}`]: rank }
  }
  if (average && count) {
    tmp.averageScore = average / count
    tmp.averageRank = ranksByNumber.value[Math.round(tmp.averageScore)]
  }
  return tmp;
}))

function sortColonne(colonneName: typeof sortBy.value) {
  if (sortBy.value === colonneName) {
    orderBy.value *= -1
  } else {
    sortBy.value = colonneName
    orderBy.value = 1
  }
}

const sortedDatabase = computed(() => {
  return database.value.filter((character) =>
    character.stars <= stars.value
  ).filter((character) =>
  !global.value || character.released
  ).filter((character) =>
  filterName.value ? character.name.toLowerCase().includes(filterName.value.toLowerCase()) : true
  ).filter((character) =>
    classes.value.find(classe => classe.classeName === character.className)?.toggle
  ).toSorted((a, b) => {
    const col = sortBy.value;
    if (['name', 'className'].includes(col)) {
      return a[col].localeCompare(b[col]) * orderBy.value;
    } if (col === 'stars') {
      return (a[col] - b[col]) * orderBy.value
    } else {
      if (a[col] === "N/A") {
        return 1
      } else if (b[col] === "N/A") {
        return -1
      } else {
        if (col === "averageRank") {
          return (a.averageScore - b.averageScore) * orderBy.value
        } else {
          const rankA = ranks.value[formatRank(a[col] as keyof typeof ranks.value)];
          const rankB = ranks.value[formatRank(b[col] as keyof typeof ranks.value)];
          return (rankA - rankB) * orderBy.value
        }
      }
    }
  })
})

console.log(database)

</script>
