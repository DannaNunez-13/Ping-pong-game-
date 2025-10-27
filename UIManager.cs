using UnityEngine;
using UnityEngine.UI;
using System.Collections;
using System;

public class UIManager : MonoBehaviour
{
    [Header("Notification System")]
    public GameObject notificationPrefab;
    public Transform notificationParent;
    public float notificationDuration = 3f;
    
    [Header("Dialog System")]
    public GameObject confirmDialogPrefab;
    public Transform dialogParent;
    
    [Header("Loading Screen")]
    public GameObject loadingScreen;
    public Slider loadingBar;
    public Text loadingText;
    
    [Header("Transition Effects")]
    public CanvasGroup fadePanel;
    public float fadeDuration = 1f;
    
    private static UIManager instance;
    public static UIManager Instance
    {
        get
        {
            if (instance == null)
                instance = FindObjectOfType<UIManager>();
            return instance;
        }
    }
    
    void Awake()
    {
        if (instance == null)
        {
            instance = this;
            DontDestroyOnLoad(gameObject);
        }
        else if (instance != this)
        {
            Destroy(gameObject);
        }
    }
    
    public void ShowNotification(string message, Color? color = null)
    {
        if (notificationPrefab == null || notificationParent == null) return;
        
        GameObject notification = Instantiate(notificationPrefab, notificationParent);
        Text notificationText = notification.GetComponentInChildren<Text>();
        
        if (notificationText != null)
        {
            notificationText.text = message;
            if (color.HasValue)
                notificationText.color = color.Value;
        }
        
        StartCoroutine(AnimateNotification(notification));
    }
    
    IEnumerator AnimateNotification(GameObject notification)
    {
        // Slide in animation
        RectTransform rectTransform = notification.GetComponent<RectTransform>();
        Vector3 startPos = rectTransform.anchoredPosition + Vector3.right * 300f;
        Vector3 endPos = rectTransform.anchoredPosition;
        
        float elapsedTime = 0f;
        float animDuration = 0.5f;
        
        while (elapsedTime < animDuration)
        {
            elapsedTime += Time.deltaTime;
            float progress = elapsedTime / animDuration;
            rectTransform.anchoredPosition = Vector3.Lerp(startPos, endPos, 
                Mathf.SmoothStep(0f, 1f, progress));
            yield return null;
        }
        
        // Wait
        yield return new WaitForSeconds(notificationDuration);
        
        // Slide out animation
        elapsedTime = 0f;
        startPos = rectTransform.anchoredPosition;
        endPos = startPos + Vector3.right * 300f;
        
        while (elapsedTime < animDuration)
        {
            elapsedTime += Time.deltaTime;
            float progress = elapsedTime / animDuration;
            rectTransform.anchoredPosition = Vector3.Lerp(startPos, endPos, 
                Mathf.SmoothStep(0f, 1f, progress));
            yield return null;
        }
        
        Destroy(notification);
    }
    
    public void ShowConfirmDialog(string message, Action onConfirm, Action onCancel = null)
    {
        if (confirmDialogPrefab == null || dialogParent == null) return;
        
        GameObject dialog = Instantiate(confirmDialogPrefab, dialogParent);
        
        // Setup dialog text
        Text dialogText = dialog.GetComponentInChildren<Text>();
        if (dialogText != null)
            dialogText.text = message;
        
        // Setup buttons
        Button[] buttons = dialog.GetComponentsInChildren<Button>();
        if (buttons.Length >= 2)
        {
            // Confirm button
            buttons[0].onClick.AddListener(() => {
                onConfirm?.Invoke();
                Destroy(dialog);
            });
            
            // Cancel button
            buttons[1].onClick.AddListener(() => {
                onCancel?.Invoke();
                Destroy(dialog);
            });
        }
        
        StartCoroutine(AnimateDialog(dialog, true));
    }
    
    IEnumerator AnimateDialog(GameObject dialog, bool fadeIn)
    {
        CanvasGroup canvasGroup = dialog.GetComponent<CanvasGroup>();
        if (canvasGroup == null)
            canvasGroup = dialog.AddComponent<CanvasGroup>();
        
        Transform dialogTransform = dialog.transform;
        
        float startAlpha = fadeIn ? 0f : 1f;
        float endAlpha = fadeIn ? 1f : 0f;
        Vector3 startScale = fadeIn ? Vector3.zero : Vector3.one;
        Vector3 endScale = fadeIn ? Vector3.one : Vector3.zero;
        
        float elapsedTime = 0f;
        float duration = 0.3f;
        
        while (elapsedTime < duration)
        {
            elapsedTime += Time.deltaTime;
            float progress = elapsedTime / duration;
            
            canvasGroup.alpha = Mathf.Lerp(startAlpha, endAlpha, progress);
            dialogTransform.localScale = Vector3.Lerp(startScale, endScale, 
                Mathf.SmoothStep(0f, 1f, progress));
            
            yield return null;
        }
        
        canvasGroup.alpha = endAlpha;
        dialogTransform.localScale = endScale;
    }
    
    public void ShowLoadingScreen(bool show)
    {
        if (loadingScreen != null)
        {
            loadingScreen.SetActive(show);
            if (show)
            {
                StartCoroutine(AnimateLoadingBar());
            }
        }
    }
    
    IEnumerator AnimateLoadingBar()
    {
        if (loadingBar == null) yield break;
        
        float progress = 0f;
        while (progress < 1f && loadingScreen.activeInHierarchy)
        {
            progress += Time.deltaTime * 0.5f; // Adjust speed as needed
            loadingBar.value = progress;
            
            if (loadingText != null)
            {
                int percentage = Mathf.RoundToInt(progress * 100f);
                loadingText.text = $"Cargando... {percentage}%";
            }
            
            yield return null;
        }
    }
    
    public void FadeScreen(bool fadeOut, Action onComplete = null)
    {
        if (fadePanel != null)
        {
            StartCoroutine(FadeCoroutine(fadeOut, onComplete));
        }
        else
        {
            onComplete?.Invoke();
        }
    }
    
    IEnumerator FadeCoroutine(bool fadeOut, Action onComplete)
    {
        float startAlpha = fadeOut ? 0f : 1f;
        float endAlpha = fadeOut ? 1f : 0f;
        float elapsedTime = 0f;
        
        fadePanel.gameObject.SetActive(true);
        
        while (elapsedTime < fadeDuration)
        {
            elapsedTime += Time.deltaTime;
            float progress = elapsedTime / fadeDuration;
            fadePanel.alpha = Mathf.Lerp(startAlpha, endAlpha, progress);
            yield return null;
        }
        
        fadePanel.alpha = endAlpha;
        
        if (!fadeOut)
            fadePanel.gameObject.SetActive(false);
        
        onComplete?.Invoke();
    }
    
    public void UpdateButtonState(Button button, bool interactable)
    {
        if (button != null)
        {
            button.interactable = interactable;
            
            // Visual feedback
            Image buttonImage = button.GetComponent<Image>();
            if (buttonImage != null)
            {
                Color color = buttonImage.color;
                color.a = interactable ? 1f : 0.5f;
                buttonImage.color = color;
            }
        }
    }
    
    public void AnimateButtonPress(Button button)
    {
        if (button != null)
        {
            StartCoroutine(ButtonPressAnimation(button.transform));
        }
    }
    
    IEnumerator ButtonPressAnimation(Transform buttonTransform)
    {
        Vector3 originalScale = buttonTransform.localScale;
        Vector3 pressedScale = originalScale * 0.95f;
        
        // Press down
        float elapsedTime = 0f;
        float duration = 0.1f;
        
        while (elapsedTime < duration)
        {
            elapsedTime += Time.deltaTime;
            float progress = elapsedTime / duration;
            buttonTransform.localScale = Vector3.Lerp(originalScale, pressedScale, progress);
            yield return null;
        }
        
        // Release
        elapsedTime = 0f;
        while (elapsedTime < duration)
        {
            elapsedTime += Time.deltaTime;
            float progress = elapsedTime / duration;
            buttonTransform.localScale = Vector3.Lerp(pressedScale, originalScale, progress);
            yield return null;
        }
        
        buttonTransform.localScale = originalScale;
    }
}