<template>
  <div class="partnership-form-component">
    <div class="form-container" :class="{ 'modal-view': modal }">
      <div class="form-header" v-if="!modal">
        <h2><i class="pi pi-star"></i> Initiate Partnership</h2>
        <p>Fill out the form below and our enterprise team will contact you within 24 hours.</p>
      </div>
      
      <form @submit.prevent="submitForm" class="partnership-form">
        <div class="form-row">
          <div class="form-group">
            <label for="company"><i class="pi pi-building"></i> Company Name *</label>
            <input 
              type="text" 
              id="company" 
              v-model="form.company"
              placeholder="e.g., Woodworks Construction Ltd"
              required
            />
          </div>
          <div class="form-group">
            <label for="industry"><i class="pi pi-tag"></i> Industry *</label>
            <select id="industry" v-model="form.industry" required>
              <option value="" disabled selected>Select industry</option>
              <option value="construction">Construction</option>
              <option value="retail">Retail Development</option>
              <option value="hospitality">Hospitality</option>
              <option value="architecture">Architecture Firm</option>
              <option value="interior-design">Interior Design</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="contact-name"><i class="pi pi-user"></i> Contact Name *</label>
            <input 
              type="text" 
              id="contact-name" 
              v-model="form.contactName"
              placeholder="Full name"
              required
            />
          </div>
          <div class="form-group">
            <label for="job-title"><i class="pi pi-briefcase"></i> Job Title *</label>
            <input 
              type="text" 
              id="job-title" 
              v-model="form.jobTitle"
              placeholder="e.g., Project Manager"
              required
            />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="email"><i class="pi pi-envelope"></i> Email *</label>
            <input 
              type="email" 
              id="email" 
              v-model="form.email"
              placeholder="you@company.com"
              required
            />
          </div>
          <div class="form-group">
            <label for="phone"><i class="pi pi-phone"></i> Phone Number</label>
            <input 
              type="tel" 
              id="phone" 
              v-model="form.phone"
              placeholder="+27 123 456 789"
            />
          </div>
        </div>

        <div class="form-group full-width">
          <label for="project-type"><i class="pi pi-th-large"></i> Project Type *</label>
          <select id="project-type" v-model="form.projectType" required>
            <option value="" disabled selected>Select project type</option>
            <option value="commercial">Commercial Development</option>
            <option value="residential">Residential Complex</option>
            <option value="hospitality">Hotel / Restaurant</option>
            <option value="retail">Retail Space</option>
            <option value="office">Office Fit-out</option>
            <option value="custom">Custom Furniture</option>
          </select>
        </div>

        <div class="form-group full-width">
          <label><i class="pi pi-chart-bar"></i> Estimated Project Scale</label>
          <div class="scale-options">
            <label class="scale-option">
              <input type="radio" v-model="form.projectScale" value="small" />
              <span>< R500k</span>
            </label>
            <label class="scale-option">
              <input type="radio" v-model="form.projectScale" value="medium" />
              <span>R500k - R2M</span>
            </label>
            <label class="scale-option">
              <input type="radio" v-model="form.projectScale" value="large" />
              <span>R2M - R10M</span>
            </label>
            <label class="scale-option">
              <input type="radio" v-model="form.projectScale" value="enterprise" />
              <span>R10M+</span>
            </label>
          </div>
        </div>

        <div class="form-group full-width">
          <label for="message"><i class="pi pi-file-edit"></i> Project Details *</label>
          <textarea 
            id="message" 
            v-model="form.message"
            rows="5"
            placeholder="Tell us about your project requirements, timeline, and any specific needs..."
            required
          ></textarea>
        </div>

        <div class="form-group full-width">
          <label class="checkbox-label">
            <input type="checkbox" v-model="form.newsletter" />
            <span><i class="pi pi-envelope"></i> I'd like to receive updates about new capabilities and industry insights</span>
          </label>
        </div>

        <div class="form-actions">
          <button type="submit" class="submit-btn" :disabled="submitting">
            <i class="pi pi-send" v-if="!submitting"></i>
            <i class="pi pi-spin pi-spinner" v-else></i>
            <span v-if="!submitting">Submit Partnership Inquiry</span>
            <span v-else>Sending...</span>
          </button>
          <p class="form-note"><i class="pi pi-info-circle"></i> Required fields. We'll respond within 24 hours.</p>
        </div>
      </form>

      <!-- Success Message -->
      <div v-if="showSuccess" class="success-message">
        <div class="success-icon"><i class="pi pi-check-circle"></i></div>
        <h3>Inquiry Sent Successfully!</h3>
        <p>Thank you for your interest. Our enterprise team will contact you shortly to discuss your partnership opportunities.</p>
        <button class="close-success" @click="closeSuccess">
          <i class="pi pi-times"></i> Close
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';
import { useToast } from 'primevue/usetoast';

export default {
  name: 'PartnershipForm',
  props: {
    modal: {
      type: Boolean,
      default: false
    }
  },
  emits: ['submitted', 'closed'],
  setup(props, { emit }) {
    const toast = useToast();
    const submitting = ref(false);
    const showSuccess = ref(false);
    
    const form = ref({
      company: '',
      industry: '',
      contactName: '',
      jobTitle: '',
      email: '',
      phone: '',
      projectType: '',
      projectScale: '',
      message: '',
      newsletter: false
    });

    const submitForm = async () => {
      submitting.value = true;
      
      setTimeout(() => {
        submitting.value = false;
        showSuccess.value = true;
        
        toast.add({
          severity: 'success',
          summary: 'Inquiry Sent',
          detail: 'Our enterprise team will contact you within 24 hours',
          life: 5000
        });
        
        emit('submitted', { ...form.value });
      }, 1500);
    };

    const closeSuccess = () => {
      showSuccess.value = false;
      form.value = {
        company: '',
        industry: '',
        contactName: '',
        jobTitle: '',
        email: '',
        phone: '',
        projectType: '',
        projectScale: '',
        message: '',
        newsletter: false
      };
      emit('closed');
    };

    return {
      form,
      submitting,
      showSuccess,
      submitForm,
      closeSuccess
    };
  }
};
</script>

<style scoped>
.partnership-form-component {
  width: 100%;
}

.form-container {
  background: white;
  border-radius: 24px;
  padding: 40px;
  box-shadow: 0 20px 40px rgba(0,0,0,0.1);
  position: relative;
}

.form-container.modal-view {
  box-shadow: none;
  padding: 0;
}

.form-header {
  text-align: center;
  margin-bottom: 40px;
}

.form-header h2 {
  font-size: 2.5rem;
  color: #1E3A5F;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-bottom: 10px;
}

.form-header p {
  color: #666;
  font-size: 1.1rem;
}

.partnership-form {
  display: flex;
  flex-direction: column;
  gap: 25px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 25px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.form-group label {
  font-weight: 600;
  color: #1E3A5F;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1rem;
}

.form-group input,
.form-group select,
.form-group textarea {
  padding: 14px;
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  font-size: 1.1rem;
  transition: border-color 0.3s;
  font-family: inherit;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #8B5E3C;
}

.scale-options {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
  margin-top: 8px;
}

.scale-option {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 1rem;
}

.scale-option:hover {
  border-color: #8B5E3C;
  background: #f8f9fa;
}

.scale-option input[type="radio"] {
  width: 18px;
  height: 18px;
  margin: 0;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  font-size: 1rem;
}

.checkbox-label input[type="checkbox"] {
  width: 20px;
  height: 20px;
  margin: 0;
}

.form-actions {
  text-align: center;
  margin-top: 30px;
}

.submit-btn {
  background: #8B5E3C;
  color: white;
  border: none;
  padding: 18px 50px;
  border-radius: 12px;
  font-size: 1.2rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  min-width: 300px;
}

.submit-btn:hover:not(:disabled) {
  background: #A67B5B;
  transform: translateY(-2px);
  box-shadow: 0 15px 30px rgba(0,0,0,0.15);
}

.submit-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.form-note {
  margin-top: 20px;
  color: #666;
  font-size: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.success-message {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: white;
  border-radius: 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 60px;
  animation: fadeIn 0.5s ease;
  z-index: 10;
}

.success-icon {
  width: 100px;
  height: 100px;
  background: #2E7D32;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 30px;
}

.success-icon i {
  font-size: 50px;
}

.success-message h3 {
  color: #1E3A5F;
  font-size: 2rem;
  margin-bottom: 15px;
}

.success-message p {
  color: #666;
  margin-bottom: 40px;
  max-width: 500px;
  font-size: 1.1rem;
  line-height: 1.6;
}

.close-success {
  background: #8B5E3C;
  color: white;
  border: none;
  padding: 15px 40px;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font-size: 1.1rem;
}

.close-success:hover {
  background: #A67B5B;
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(0,0,0,0.1);
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .scale-options {
    grid-template-columns: 1fr;
  }
  
  .form-container {
    padding: 20px;
  }
  
  .form-header h2 {
    font-size: 1.8rem;
  }
  
  .submit-btn {
    min-width: 100%;
    padding: 15px 30px;
  }
  
  .success-message {
    padding: 30px;
  }
  
  .success-message h3 {
    font-size: 1.5rem;
  }
}
</style>