import { defineStore } from 'pinia'

export const useCoachStore = defineStore('coach', {
  state: () => ({
    coaches: [
      {
        id: 1,
        name: 'John Smith'
      }
    ]
  }),

  actions: {
    addCoach(coach) {
      this.coaches.push({
        id: Date.now(),
        name: coach.name
      })
    },

    updateCoach(updatedCoach) {
      const index = this.coaches.findIndex(c => c.id === updatedCoach.id)
      if (index !== -1) {
        this.coaches[index] = updatedCoach
      }
    },

    deleteCoach(coachId) {
      this.coaches = this.coaches.filter(c => c.id !== coachId)
    }
  }
})
