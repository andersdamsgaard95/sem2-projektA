<script setup>
  import { ref } from 'vue';

  const emailInput = ref(null); //ref til html email-input
  const kodeInput = ref(null); //ref til html kode-input

  const emailValideringsBesked = ref('');
  const kodeValideringsBesked = ref('');

  const isEmailValid = ref(false);
  const isPasswordValid = ref(false);

  const userSuccesfullyCreated = ref(false);

  // EMAIL VALIDERING
  function validateEmail() {
    const email = emailInput.value.value;

    if (email.length === 0) {
      emailValideringsBesked.value = '';
      isEmailValid.value = false;
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (!emailRegex.test(email)) {
      emailValideringsBesked.value = 'e-mail ikke gyldig!'
      isEmailValid.value = false;   
    } else {
      emailValideringsBesked.value = 'e-mail gyldig';
      isEmailValid.value = true;
    }
  }

  // KODE VALIDERING
  function validatePassword() {
    const kode = kodeInput.value.value;

    if (kode.length === 0) {
      kodeValideringsBesked.value = '';
      isPasswordValid.value = false;
      return;
    }
    
    const isLongEnough = kode.length >= 6;
    const hasNumber = /[0-9]/.test(kode);
    const hasCharacter = /[!@#$%^&*]/.test(kode);

    let errors = [];

    if (!isLongEnough) errors.push('mindst 6 tegn');
    if (!hasNumber) errors.push('mindst ét nummer');
    if (!hasCharacter) errors.push('mindst ét specialtegn'); 

    if (errors.length > 0) {
      kodeValideringsBesked.value = `Koden skal indeholde ${errors.join(', ')}`
      isPasswordValid.value = false;
    } else {
      kodeValideringsBesked.value = 'Stærk kode';
      isPasswordValid.value = true;
    }
  }

  // Brugeroprettelse succes
  function succesfullUserCreation() {
    userSuccesfullyCreated.value = true;

    setTimeout(() => {
      userSuccesfullyCreated.value = false;
    }, 3000)

    emailInput.value.value = '';
    emailValideringsBesked.value = '';
    kodeInput.value.value = '';
    kodeValideringsBesked.value = '';
  }

</script>

<template>
  <h1>Login</h1>

  <div class="wrapper">
    <!-- email input -->
    <div>
      <input @input="validateEmail" ref="emailInput" placeholder="e-mail" type="text">
      <p 
        v-if="emailValideringsBesked"
        class="valideringBesked"
        :class="isEmailValid ? 'green' : 'red'"
      >
        {{ emailValideringsBesked }}
      </p>
    </div>
    
    <!-- kode input -->
    <div>
      <input @input="validatePassword" ref="kodeInput" placeholder="kode" type="text">
      <p 
        v-if="kodeValideringsBesked" 
        class="valideringBesked"
        :class="isPasswordValid ? 'green' : 'red'"
      >
        {{ kodeValideringsBesked }}
      </p>
    </div>
    
    <!-- Knap -->
    <button
      :disabled="!isEmailValid || !isPasswordValid"
      @click="succesfullUserCreation"
    >
      Opret bruger
    </button>
  </div> 

  <!-- Popup -->
  <div v-if="userSuccesfullyCreated" class="popup">
    <p>Bruger oprettet</p>
  </div>
</template>


<style scoped>
  .wrapper {
    display: flex;
    flex-direction: column;
    width: 300px;
    gap: 20px;
  }

  .valideringBesked {
    font-size: 12px;
  }

  .red {
    color: red;
  }

  .green {
    color: green;
  }

  .popup {
    position: fixed;
    top: 100px;
    left: 100px;
    border: 1px solid black;
    padding: 50px;
    background-color: beige;
  }
</style>