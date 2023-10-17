import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { from } from 'rxjs';

@Component({
  selector: 'app-chatbot',
  templateUrl: './chatbot.component.html',
  styleUrls: ['./chatbot.component.scss']
})
export class ChatbotComponent implements OnInit {
  messages: ChatMessage[] = [];
  userInput: string = '';
  apiUrl = 'https://api.openai.com/v1/chat/completions';
  apiKey = "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";

  // Add loading and error variables
  loading: boolean = false;
  error: string | null = null;

  formattedResponse: SafeHtml = '';
  customErrorMessage: string | null = null;

  isLoading: boolean = false;
  errorOccurred: boolean = false;

  constructor(private http: HttpClient, private sanitizer: DomSanitizer) { }

  ngOnInit() {
    this.messages.push({ text: 'Hello! How can I assist you today?', user: false });
  }

  async sendMessage() {
    if (this.userInput.trim() === '') return;

    this.messages.push({ text: this.userInput, user: true });

    const userMessage = this.userInput;

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.apiKey}`
    });

    const conversation = [
      { role: 'system', content: 'You are a helpful assistant.' },
      { role: 'user', content: userMessage },
    ];

    this.isLoading = true; // Set loading to true when the request starts
    this.errorOccurred = false; // Reset the error flag
    this.customErrorMessage = ''; // Reset the custom error message

    try {
      const response = await this.http.post(this.apiUrl, { model: 'gpt-4', messages: conversation }, { headers }).toPromise();
      if (response && 'choices' in response) {
        // ... (your existing code)
      } else {
        this.handleError("Invalid or empty response from the API.");
      }
    } catch (error) {
      this.handleError("I'm experiencing technical difficulties at the moment. Please try again later.");
      console.error(error);
    } finally {
      this.isLoading = false; // Set loading to false when the request completes
    }
  }

  handleError(errorMessage: string): void {
    this.customErrorMessage = errorMessage;
    this.errorOccurred = true; // Set error flag to true
  }

  formatCodeBlock(code: string): SafeHtml {
    const formattedCode = this.sanitizer.bypassSecurityTrustHtml(`<pre><code>${code}</code></pre>`);
    return formattedCode;
  }
}

interface ChatMessage {
  text: string;
  user: boolean;
}

