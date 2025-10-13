# 🎯 Model Directory - PLACE YOUR MODEL HERE!

## ⚠️ IMPORTANT: Where to Put Your Trained Model

### Quick Instructions
Place your trained model file here with this exact name:
```
backend/models/melanoma_classifier.pth
```

### Current Status
- **No model file detected** - System is running in DEMO MODE
- Upload your trained model to enable real predictions

## Model File Requirements

Place your trained model checkpoint here:
- **Exact Path**: `backend/models/melanoma_classifier.pth`
- **Format**: PyTorch state dict checkpoint
- **Architecture**: Must match `MultiTaskMelanomaNet` from `network.py`

## Model Structure

The checkpoint should contain:
```python
{
    'model_state_dict': <model_state_dict>,
    'optimizer_state_dict': <optimizer_state_dict>,  # optional
    'epoch': <epoch_number>,  # optional
    'loss': <loss_value>,  # optional
}
```

## Demo Mode

If no model file is found, the application will run in **demo mode** with simulated predictions for demonstration purposes.

## Training

To train your own model:
1. Prepare the HAM10000 dataset
2. Use the `MultiTaskMelanomaNet` architecture from `network.py`
3. Train with the `MultiTaskLoss` for multi-task learning
4. Save the checkpoint with `torch.save(checkpoint, 'melanoma_classifier.pth')`

## Model Download

If you have a pre-trained model, place it in this directory and ensure it matches the expected architecture (7 classes, 5 ABCDE features).

