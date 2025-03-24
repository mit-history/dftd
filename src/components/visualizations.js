export const viewof dataset = html`
  <div class="tab-bar">
    <button class="tab-button active" data-value="french">🇫🇷 French</button>
    <button class="tab-button" data-value="danish">🇩🇰 Danish</button>
    <button class="tab-button" data-value="dutch">🇳🇱 Dutch</button>
  </div>
  <input type="hidden" value="french" />
  <script>
    const tabs = this.querySelectorAll(".tab-button");
    const input = this.querySelector("input");
    tabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        tabs.forEach(t => t.classList.remove("active"));
        tab.classList.add("active");
        input.value = tab.dataset.value;
        input.dispatchEvent(new CustomEvent("input"));
      });
    });
  </script>
`
